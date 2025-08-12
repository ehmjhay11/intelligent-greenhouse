#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <Preferences.h>

// WiFi Configuration
const char* ssid = "realme 10 Pro 5G";
const char* password = "z2padqiy";

// MQTT Configuration
const char* mqtt_broker = "10.240.100.213";
const int mqtt_port = 1883;

// Device Configuration - Change this for each ESP32
const int DEVICE_ID = 1; // Change to 2, 3, etc. for other devices

// MQTT Topics
String topic_temperature = "esp32_" + String(DEVICE_ID) + "/temperature";
String topic_humidity = "esp32_" + String(DEVICE_ID) + "/humidity";
String topic_soil = "esp32_" + String(DEVICE_ID) + "/soil_moisture";
String topic_light = "esp32_" + String(DEVICE_ID) + "/light";
String topic_commands = "esp32_" + String(DEVICE_ID) + "/commands";
String topic_status = "esp32_" + String(DEVICE_ID) + "/status";

// Sensor Configuration
#define DHTPIN 4
#define DHTTYPE DHT22
#define SOIL_PIN 32
#define LDR_PIN 33

// LED Configuration
#define LED_LOW_PIN 5
#define LED_HIGH_PIN 18
#define SOIL_LED_PIN 19
#define HUMIDITY_LED_PIN 21
#define TEMP_LED_PIN 22
#define LIGHT_LED_PIN 23

// Calibration values
const int DRY_VALUE = 4095;
const int WET_VALUE = 1500;
const int LDR_DARK = 3500;
const int LDR_LIGHT = 500;

// Default Thresholds (will be updated via MQTT and persisted)
struct Thresholds {
  struct {
    float min = 15.0;
    float max = 35.0;
    float ideal_min = 20.0;
    float ideal_max = 30.0;
  } temperature;
  
  struct {
    float min = 40.0;
    float max = 80.0;
    float ideal_min = 60.0;
    float ideal_max = 70.0;
  } humidity;
  
  struct {
    float min = 30.0;
    float max = 90.0;
    float ideal_min = 50.0;
    float ideal_max = 70.0;
  } soil_moisture;
  
  struct {
    float min = 200.0;
    float max = 1000.0;
    float ideal_min = 400.0;
    float ideal_max = 800.0;
  } light;
};

Thresholds thresholds;
Preferences preferences;

DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient mqttClient(espClient);
unsigned long lastPublish = 0;
unsigned long lastStatusUpdate = 0;
bool thresholdsFromDashboard = false; // Track if thresholds came from dashboard

void setup() {
  Serial.begin(115200);
  dht.begin();

  // Initialize NVS preferences
  preferences.begin("thresholds", false);
  
  // Load saved thresholds from memory
  loadThresholdsFromMemory();

  // Initialize pins
  pinMode(SOIL_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);
  pinMode(LED_LOW_PIN, OUTPUT);
  pinMode(LED_HIGH_PIN, OUTPUT);
  pinMode(SOIL_LED_PIN, OUTPUT);
  pinMode(HUMIDITY_LED_PIN, OUTPUT);
  pinMode(TEMP_LED_PIN, OUTPUT);
  pinMode(LIGHT_LED_PIN, OUTPUT);

  // Turn off all LEDs initially
  digitalWrite(LED_LOW_PIN, LOW);
  digitalWrite(LED_HIGH_PIN, LOW);
  digitalWrite(SOIL_LED_PIN, LOW);
  digitalWrite(HUMIDITY_LED_PIN, LOW);
  digitalWrite(TEMP_LED_PIN, LOW);
  digitalWrite(LIGHT_LED_PIN, LOW);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Setup MQTT
  mqttClient.setServer(mqtt_broker, mqtt_port);
  mqttClient.setCallback(onMqttMessage);
  mqttClient.setBufferSize(2048); // Increase buffer size for larger messages
  
  Serial.println("=== ESP32 Plant Monitor Ready ===");
  Serial.println("Device ID: " + String(DEVICE_ID));
  Serial.println("Command Topic: " + topic_commands);
  Serial.println("MQTT Buffer Size: 2048 bytes");
  
  // Print loaded thresholds
  printCurrentThresholds();
  
  if (thresholdsFromDashboard) {
    Serial.println("✅ Using thresholds configured from dashboard");
  } else {
    Serial.println("⚠️ Using default thresholds - waiting for dashboard configuration...");
  }
}

void loop() {
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();

  // Publish sensor data every 5 seconds
  if (millis() - lastPublish >= 5000) {
    lastPublish = millis();
    publishSensorData();
  }

  // Send status update every 30 seconds
  if (millis() - lastStatusUpdate >= 30000) {
    lastStatusUpdate = millis();
    publishStatusUpdate();
  }

  // Log current thresholds and status every 20 seconds
  static unsigned long lastThresholdLog = 0;
  if (millis() - lastThresholdLog >= 20000) {
    lastThresholdLog = millis();
    logCurrentStatus();
  }

  // Test MQTT connectivity every 60 seconds
  static unsigned long lastMQTTTest = 0;
  if (millis() - lastMQTTTest >= 60000) {
    lastMQTTTest = millis();
    testMQTTConnectivity();
  }

  delay(10);
}

void connectMQTT() {
  Serial.print("Connecting to MQTT...");
  
  // Test basic network connectivity to MQTT broker
  Serial.println("\n🔍 === TESTING MQTT BROKER CONNECTIVITY ===");
  WiFiClient testClient;
  Serial.println("🌐 Testing TCP connection to " + String(mqtt_broker) + ":" + String(mqtt_port));
  
  if (testClient.connect(mqtt_broker, mqtt_port)) {
    Serial.println("✅ TCP connection to MQTT broker successful");
    testClient.stop();
  } else {
    Serial.println("❌ TCP connection to MQTT broker FAILED");
    Serial.println("❌ This indicates network/firewall issues");
    delay(5000);
    return;
  }
  
  while (!mqttClient.connected()) {
    String clientId = "ESP32_Device_" + String(DEVICE_ID) + "_" + String(random(0xffff), HEX);
    Serial.println("\n🔄 === MQTT CONNECTION ATTEMPT ===");
    Serial.println("📡 Broker: " + String(mqtt_broker) + ":" + String(mqtt_port));
    Serial.println("🆔 Client ID: " + clientId);
    Serial.println("📺 Will subscribe to: " + topic_commands);
    Serial.println("📤 Will publish status to: " + topic_status);
    
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("✅ MQTT connected successfully!");
      Serial.println("ESP32 Device #" + String(DEVICE_ID) + " ready");
      
      // Subscribe to command topic with detailed logging
      Serial.println("📡 Subscribing to command topic: " + topic_commands);
      bool subscribeResult = mqttClient.subscribe(topic_commands.c_str(), 1); // QoS 1
      Serial.println("Subscribe result: " + String(subscribeResult ? "✅ SUCCESS" : "❌ FAILED"));
      Serial.println("QoS Level: 1 (At least once delivery)");
      
      if (subscribeResult) {
        Serial.println("🎯 Successfully subscribed to: " + topic_commands);
        Serial.println("🔄 ESP32 is now ready to receive threshold commands!");
        Serial.println("📋 Backend should send commands to: esp32_" + String(DEVICE_ID) + "/commands");
        
        // Double-check subscription status
        Serial.println("🔍 Verifying subscription...");
        delay(1000); // Wait a moment for subscription to take effect
        
      } else {
        Serial.println("❌ Failed to subscribe to command topic!");
        Serial.println("❌ This means ESP32 cannot receive commands from backend!");
      }
      
      // Send initial status
      publishStatusUpdate();
      
      // Send a welcome message with detailed info
      String welcomeMsg = "{\"device_id\":" + String(DEVICE_ID) + 
                         ",\"message\":\"ESP32 connected and ready for commands\"" +
                         ",\"subscribed_topic\":\"" + topic_commands + "\"" +
                         ",\"status_topic\":\"" + topic_status + "\"" +
                         ",\"has_saved_thresholds\":" + String(thresholdsFromDashboard ? "true" : "false") + 
                         ",\"wifi_rssi\":" + String(WiFi.RSSI()) + 
                         ",\"free_heap\":" + String(ESP.getFreeHeap()) + "}";
      mqttClient.publish(topic_status.c_str(), welcomeMsg.c_str());
      
      Serial.println("📤 Welcome message sent");
      Serial.println("=== MQTT CONNECTION ESTABLISHED ===\n");
      
    } else {
      Serial.print("❌ MQTT connection failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" trying again in 2s");
      Serial.println("❌ Error codes: -4=timeout, -3=lost, -2=failed, -1=disconnected");
      delay(2000);
    }
  }
}

void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.println("\n🚨 === MQTT MESSAGE RECEIVED ===");
  Serial.println("📡 Received Topic: '" + String(topic) + "'");
  Serial.println("🎯 Expected Topic: '" + topic_commands + "'");
  Serial.println("✅ Topic Match: " + String(String(topic) == topic_commands ? "YES" : "NO"));
  Serial.println("📏 Message Length: " + String(length));
  Serial.println("📄 Raw Message: '" + message + "'");
  Serial.println("🕐 Timestamp: " + String(millis()) + "ms");
  
  if (String(topic) == topic_commands) {
    Serial.println("✅ TOPIC MATCHES! Processing command...");
    handleCommand(message);
  } else {
    Serial.println("❌ TOPIC MISMATCH! Ignoring message.");
    Serial.println("   Received: '" + String(topic) + "'");
    Serial.println("   Expected: '" + topic_commands + "'");
  }
  
  Serial.println("=== END MQTT MESSAGE ===\n");
}

void handleCommand(String jsonMessage) {
  Serial.println("🔧 === PROCESSING COMMAND ===");
  Serial.println("📄 JSON Input: " + jsonMessage);
  
  DynamicJsonDocument doc(2048);
  DeserializationError error = deserializeJson(doc, jsonMessage);
  
  if (error) {
    Serial.println("❌ JSON PARSING FAILED!");
    Serial.println("❌ Error: " + String(error.c_str()));
    Serial.println("❌ Raw message: " + jsonMessage);
    
    // Send error response
    String errorResponse = "{\"device_id\":" + String(DEVICE_ID) + ",\"error\":\"JSON parsing failed\",\"raw_message\":\"" + jsonMessage + "\"}";
    mqttClient.publish(topic_status.c_str(), errorResponse.c_str());
    return;
  }
  
  String command = doc["command"];
  Serial.println("📋 Parsed Command: '" + command + "'");
  
  if (command == "update_thresholds") {
    Serial.println("🎯 UPDATING THRESHOLDS FROM DASHBOARD...");
    if (doc.containsKey("thresholds")) {
      updateThresholds(doc["thresholds"]);
    } else {
      Serial.println("❌ No 'thresholds' key found in command!");
    }
  } else if (command == "get_status") {
    Serial.println("📊 STATUS REQUEST RECEIVED");
    publishStatusUpdate();
  } else if (command == "test") {
    Serial.println("🧪 TEST COMMAND RECEIVED");
    // Just respond to test command without resetting thresholds
    String testResponse = "{\"device_id\":" + String(DEVICE_ID) + ",\"status\":\"success\",\"message\":\"Test command received - thresholds preserved\"}";
    mqttClient.publish(topic_status.c_str(), testResponse.c_str());
  } else {
    Serial.println("❌ UNKNOWN COMMAND: '" + command + "'");
    
    // Send unknown command response
    String unknownResponse = "{\"device_id\":" + String(DEVICE_ID) + ",\"error\":\"Unknown command\",\"received_command\":\"" + command + "\"}";
    mqttClient.publish(topic_status.c_str(), unknownResponse.c_str());
  }
  
  Serial.println("=== COMMAND PROCESSING COMPLETE ===\n");
}

void updateThresholds(JsonObject newThresholds) {
  Serial.println("\n🔄 === UPDATING PLANT THRESHOLDS FROM DASHBOARD ===");
  bool anyUpdated = false;
  
  if (newThresholds.containsKey("temperature")) {
    JsonObject temp = newThresholds["temperature"];
    Serial.println("📊 Temperature thresholds found:");
    Serial.println("   Min: " + String((float)temp["min"]));
    Serial.println("   Max: " + String((float)temp["max"]));
    Serial.println("   Ideal Min: " + String((float)temp["ideal_min"]));
    Serial.println("   Ideal Max: " + String((float)temp["ideal_max"]));
    
    thresholds.temperature.min = temp["min"];
    thresholds.temperature.max = temp["max"];
    thresholds.temperature.ideal_min = temp["ideal_min"];
    thresholds.temperature.ideal_max = temp["ideal_max"];
    Serial.println("✅ Temperature thresholds updated");
    anyUpdated = true;
  }
  
  if (newThresholds.containsKey("humidity")) {
    JsonObject hum = newThresholds["humidity"];
    Serial.println("📊 Humidity thresholds found:");
    Serial.println("   Min: " + String((float)hum["min"]));
    Serial.println("   Max: " + String((float)hum["max"]));
    Serial.println("   Ideal Min: " + String((float)hum["ideal_min"]));
    Serial.println("   Ideal Max: " + String((float)hum["ideal_max"]));
    
    thresholds.humidity.min = hum["min"];
    thresholds.humidity.max = hum["max"];
    thresholds.humidity.ideal_min = hum["ideal_min"];
    thresholds.humidity.ideal_max = hum["ideal_max"];
    Serial.println("✅ Humidity thresholds updated");
    anyUpdated = true;
  }
  
  if (newThresholds.containsKey("soil_moisture")) {
    JsonObject soil = newThresholds["soil_moisture"];
    Serial.println("📊 Soil moisture thresholds found:");
    Serial.println("   Min: " + String((float)soil["min"]));
    Serial.println("   Max: " + String((float)soil["max"]));
    Serial.println("   Ideal Min: " + String((float)soil["ideal_min"]));
    Serial.println("   Ideal Max: " + String((float)soil["ideal_max"]));
    
    thresholds.soil_moisture.min = soil["min"];
    thresholds.soil_moisture.max = soil["max"];
    thresholds.soil_moisture.ideal_min = soil["ideal_min"];
    thresholds.soil_moisture.ideal_max = soil["ideal_max"];
    Serial.println("✅ Soil moisture thresholds updated");
    anyUpdated = true;
  }
  
  if (newThresholds.containsKey("light")) {
    JsonObject light = newThresholds["light"];
    Serial.println("📊 Light thresholds found:");
    Serial.println("   Min: " + String((float)light["min"]));
    Serial.println("   Max: " + String((float)light["max"]));
    Serial.println("   Ideal Min: " + String((float)light["ideal_min"]));
    Serial.println("   Ideal Max: " + String((float)light["ideal_max"]));
    
    thresholds.light.min = light["min"];
    thresholds.light.max = light["max"];
    thresholds.light.ideal_min = light["ideal_min"];
    thresholds.light.ideal_max = light["ideal_max"];
    Serial.println("✅ Light thresholds updated");
    anyUpdated = true;
  }
  
  if (anyUpdated) {
    // Mark that thresholds came from dashboard
    thresholdsFromDashboard = true;
    
    // Save thresholds to persistent memory
    saveThresholdsToMemory();
    
    Serial.println("🎉 ALL THRESHOLDS UPDATED AND SAVED TO MEMORY!");
    printCurrentThresholds();
    
    // Send detailed confirmation back to dashboard
    String response = "{\"device_id\":" + String(DEVICE_ID) + 
                    ",\"status\":\"success\"" +
                    ",\"message\":\"Thresholds updated and saved to memory\"" +
                    ",\"timestamp\":" + String(millis()) + 
                    ",\"persistent\":true}";
    mqttClient.publish(topic_status.c_str(), response.c_str());
    Serial.println("📤 Confirmation sent to dashboard");
  } else {
    Serial.println("⚠️ No valid threshold data found in command!");
  }
  
  Serial.println("=== THRESHOLD UPDATE COMPLETE ===\n");
}

void saveThresholdsToMemory() {
  Serial.println("💾 Saving thresholds to persistent memory...");
  
  preferences.putFloat("temp_min", thresholds.temperature.min);
  preferences.putFloat("temp_max", thresholds.temperature.max);
  preferences.putFloat("temp_ideal_min", thresholds.temperature.ideal_min);
  preferences.putFloat("temp_ideal_max", thresholds.temperature.ideal_max);
  
  preferences.putFloat("hum_min", thresholds.humidity.min);
  preferences.putFloat("hum_max", thresholds.humidity.max);
  preferences.putFloat("hum_ideal_min", thresholds.humidity.ideal_min);
  preferences.putFloat("hum_ideal_max", thresholds.humidity.ideal_max);
  
  preferences.putFloat("soil_min", thresholds.soil_moisture.min);
  preferences.putFloat("soil_max", thresholds.soil_moisture.max);
  preferences.putFloat("soil_ideal_min", thresholds.soil_moisture.ideal_min);
  preferences.putFloat("soil_ideal_max", thresholds.soil_moisture.ideal_max);
  
  preferences.putFloat("light_min", thresholds.light.min);
  preferences.putFloat("light_max", thresholds.light.max);
  preferences.putFloat("light_ideal_min", thresholds.light.ideal_min);
  preferences.putFloat("light_ideal_max", thresholds.light.ideal_max);
  
  preferences.putBool("from_dashboard", thresholdsFromDashboard);
  
  Serial.println("✅ Thresholds saved to memory");
}

void loadThresholdsFromMemory() {
  Serial.println("📖 Loading thresholds from persistent memory...");
  
  // Check if we have saved thresholds
  thresholdsFromDashboard = preferences.getBool("from_dashboard", false);
  
  if (thresholdsFromDashboard) {
    Serial.println("📱 Found saved thresholds from dashboard");
    
    thresholds.temperature.min = preferences.getFloat("temp_min", 15.0);
    thresholds.temperature.max = preferences.getFloat("temp_max", 35.0);
    thresholds.temperature.ideal_min = preferences.getFloat("temp_ideal_min", 20.0);
    thresholds.temperature.ideal_max = preferences.getFloat("temp_ideal_max", 30.0);
    
    thresholds.humidity.min = preferences.getFloat("hum_min", 40.0);
    thresholds.humidity.max = preferences.getFloat("hum_max", 80.0);
    thresholds.humidity.ideal_min = preferences.getFloat("hum_ideal_min", 60.0);
    thresholds.humidity.ideal_max = preferences.getFloat("hum_ideal_max", 70.0);
    
    thresholds.soil_moisture.min = preferences.getFloat("soil_min", 30.0);
    thresholds.soil_moisture.max = preferences.getFloat("soil_max", 90.0);
    thresholds.soil_moisture.ideal_min = preferences.getFloat("soil_ideal_min", 50.0);
    thresholds.soil_moisture.ideal_max = preferences.getFloat("soil_ideal_max", 70.0);
    
    thresholds.light.min = preferences.getFloat("light_min", 200.0);
    thresholds.light.max = preferences.getFloat("light_max", 1000.0);
    thresholds.light.ideal_min = preferences.getFloat("light_ideal_min", 400.0);
    thresholds.light.ideal_max = preferences.getFloat("light_ideal_max", 800.0);
    
    Serial.println("✅ Dashboard thresholds loaded from memory");
  } else {
    Serial.println("🔧 No saved dashboard thresholds found, using defaults");
    // Default values are already set in struct initialization
  }
}

void printCurrentThresholds() {
  Serial.println("\n📋 === CURRENT THRESHOLDS ===");
  Serial.println("Source: " + String(thresholdsFromDashboard ? "Dashboard (Persistent)" : "Default Values"));
  Serial.println("🌡️ Temperature: " + String(thresholds.temperature.min) + "-" + String(thresholds.temperature.max) + "°C (Ideal: " + String(thresholds.temperature.ideal_min) + "-" + String(thresholds.temperature.ideal_max) + "°C)");
  Serial.println("💧 Humidity: " + String(thresholds.humidity.min) + "-" + String(thresholds.humidity.max) + "% (Ideal: " + String(thresholds.humidity.ideal_min) + "-" + String(thresholds.humidity.ideal_max) + "%)");
  Serial.println("🌱 Soil: " + String(thresholds.soil_moisture.min) + "-" + String(thresholds.soil_moisture.max) + "% (Ideal: " + String(thresholds.soil_moisture.ideal_min) + "-" + String(thresholds.soil_moisture.ideal_max) + "%)");
  Serial.println("☀️ Light: " + String(thresholds.light.min) + "-" + String(thresholds.light.max) + " (Ideal: " + String(thresholds.light.ideal_min) + "-" + String(thresholds.light.ideal_max) + ")");
  Serial.println("=== END THRESHOLDS ===\n");
}

void publishStatusUpdate() {
  DynamicJsonDocument doc(512);
  doc["device_id"] = DEVICE_ID;
  doc["status"] = "online";
  doc["wifi_rssi"] = WiFi.RSSI();
  doc["uptime"] = millis();
  doc["free_heap"] = ESP.getFreeHeap();
  doc["timestamp"] = millis();
  doc["subscribed_topic"] = topic_commands;
  doc["mqtt_connected"] = mqttClient.connected();
  doc["thresholds_source"] = thresholdsFromDashboard ? "dashboard" : "default";
  doc["thresholds_persistent"] = thresholdsFromDashboard;
  
  String statusJson;
  serializeJson(doc, statusJson);
  
  mqttClient.publish(topic_status.c_str(), statusJson.c_str());
  Serial.println("📊 Status update sent: " + statusJson);
}

int readSoilMoisture() {
  int rawValue = analogRead(SOIL_PIN);
  int moisturePercent = map(rawValue, DRY_VALUE, WET_VALUE, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);

  // LED control based on thresholds
  if (moisturePercent < thresholds.soil_moisture.ideal_min) {
    digitalWrite(SOIL_LED_PIN, HIGH); // Too dry
  } else if (moisturePercent > thresholds.soil_moisture.ideal_max) {
    digitalWrite(SOIL_LED_PIN, HIGH); // Too wet
  } else {
    digitalWrite(SOIL_LED_PIN, LOW); // Optimal
  }

  return moisturePercent;
}

int readLDR() {
  int rawValue = analogRead(LDR_PIN);
  int lightPercent = map(rawValue, LDR_LIGHT, LDR_DARK, 100, 0);
  lightPercent = constrain(lightPercent, 0, 100);

  // LED control based on thresholds
  if (lightPercent < thresholds.light.ideal_min) {
    digitalWrite(LIGHT_LED_PIN, HIGH); // Too dark
  } else if (lightPercent > thresholds.light.ideal_max) {
    digitalWrite(LED_HIGH_PIN, HIGH); // Too bright
  } else {
    digitalWrite(LIGHT_LED_PIN, LOW);
    digitalWrite(LED_HIGH_PIN, LOW); // Optimal
  }

  return lightPercent;
}

void controlTemperatureLEDs(float temperature) {
  if (temperature < thresholds.temperature.ideal_min) {
    digitalWrite(TEMP_LED_PIN, HIGH); // Too cold
  } else if (temperature > thresholds.temperature.ideal_max) {
    digitalWrite(TEMP_LED_PIN, HIGH); // Too hot
  } else {
    digitalWrite(TEMP_LED_PIN, LOW); // Optimal
  }
}

void controlHumidityLEDs(float humidity) {
  if (humidity < thresholds.humidity.ideal_min || humidity > thresholds.humidity.ideal_max) {
    digitalWrite(HUMIDITY_LED_PIN, HIGH); // Out of range
  } else {
    digitalWrite(HUMIDITY_LED_PIN, LOW); // Optimal
  }
}

void publishSensorData() {
  Serial.println("\n=== ESP32 Device #" + String(DEVICE_ID) + " Reading ===");

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int soil = readSoilMoisture();
  int light = readLDR();

  // Control LEDs based on thresholds
  if (!isnan(temperature)) {
    controlTemperatureLEDs(temperature);
  }
  if (!isnan(humidity)) {
    controlHumidityLEDs(humidity);
  }

  // Print sensor readings with threshold status
  Serial.println("🌡️ Temperature: " + String(temperature) + "°C " + getThresholdStatus(temperature, thresholds.temperature.ideal_min, thresholds.temperature.ideal_max));
  Serial.println("💧 Humidity: " + String(humidity) + "% " + getThresholdStatus(humidity, thresholds.humidity.ideal_min, thresholds.humidity.ideal_max));
  Serial.println("🌱 Soil: " + String(soil) + "% " + getThresholdStatus(soil, thresholds.soil_moisture.ideal_min, thresholds.soil_moisture.ideal_max));
  Serial.println("☀️ Light: " + String(light) + " " + getThresholdStatus(light, thresholds.light.ideal_min, thresholds.light.ideal_max));

  // Publish each sensor to its own topic
  if (mqttClient.connected()) {
    
    // Temperature
    if (!isnan(temperature)) {
      String tempPayload = "{\"temperature\":" + String(temperature, 1) + ",\"status\":\"" + getThresholdStatus(temperature, thresholds.temperature.ideal_min, thresholds.temperature.ideal_max) + "\"}";
      mqttClient.publish(topic_temperature.c_str(), tempPayload.c_str());
    }
    
    // Humidity
    if (!isnan(humidity)) {
      String humPayload = "{\"humidity\":" + String(humidity, 1) + ",\"status\":\"" + getThresholdStatus(humidity, thresholds.humidity.ideal_min, thresholds.humidity.ideal_max) + "\"}";
      mqttClient.publish(topic_humidity.c_str(), humPayload.c_str());
    }
    
    // Soil Moisture
    String soilPayload = "{\"soil_moisture\":" + String(soil) + ",\"status\":\"" + getThresholdStatus(soil, thresholds.soil_moisture.ideal_min, thresholds.soil_moisture.ideal_max) + "\"}";
    mqttClient.publish(topic_soil.c_str(), soilPayload.c_str());
    
    // Light Level
    String lightPayload = "{\"light_level\":" + String(light) + ",\"status\":\"" + getThresholdStatus(light, thresholds.light.ideal_min, thresholds.light.ideal_max) + "\"}";
    mqttClient.publish(topic_light.c_str(), lightPayload.c_str());
    
  } else {
    Serial.println("❌ MQTT not connected!");
  }
}

String getThresholdStatus(float value, float idealMin, float idealMax) {
  if (value >= idealMin && value <= idealMax) {
    return "OPTIMAL";
  } else if (value < idealMin) {
    return "LOW";
  } else {
    return "HIGH";
  }
}

void logCurrentStatus() {
  Serial.println("\n🔄 === 20-SECOND STATUS LOG ===");
  Serial.println("🕐 Uptime: " + String(millis() / 1000) + " seconds");
  Serial.println("📶 WiFi Status: " + String(WiFi.isConnected() ? "Connected" : "Disconnected"));
  Serial.println("📶 WiFi RSSI: " + String(WiFi.RSSI()) + " dBm");
  Serial.println("📡 MQTT Status: " + String(mqttClient.connected() ? "Connected" : "Disconnected"));
  
  if (mqttClient.connected()) {
    Serial.println("✅ MQTT Broker: " + String(mqtt_broker) + ":" + String(mqtt_port));
    Serial.println("📺 Listening on: " + topic_commands);
  } else {
    Serial.println("❌ MQTT Disconnected - will attempt reconnection");
  }
  
  Serial.println("🆔 Device ID: " + String(DEVICE_ID));
  Serial.println("💾 Free Heap: " + String(ESP.getFreeHeap()) + " bytes");
  
  // Current thresholds summary
  Serial.println("📋 Threshold Source: " + String(thresholdsFromDashboard ? "Dashboard (Persistent)" : "Default Values"));
  Serial.println("🌡️ Temp: " + String(thresholds.temperature.ideal_min) + "-" + String(thresholds.temperature.ideal_max) + "°C");
  Serial.println("💧 Humidity: " + String(thresholds.humidity.ideal_min) + "-" + String(thresholds.humidity.ideal_max) + "%");
  Serial.println("🌱 Soil: " + String(thresholds.soil_moisture.ideal_min) + "-" + String(thresholds.soil_moisture.ideal_max) + "%");
  Serial.println("☀️ Light: " + String(thresholds.light.ideal_min) + "-" + String(thresholds.light.ideal_max));
  
  Serial.println("=== END STATUS LOG ===\n");
}

void testMQTTConnectivity() {
  Serial.println("\n🧪 === MQTT CONNECTIVITY TEST ===");
  
  if (mqttClient.connected()) {
    // Send a test message to verify MQTT publishing works
    String testPayload = "{\"device_id\":" + String(DEVICE_ID) + 
                        ",\"test\":\"connectivity_check\"" +
                        ",\"timestamp\":" + String(millis()) + 
                        ",\"subscribed_topic\":\"" + topic_commands + "\"" +
                        ",\"message\":\"ESP32 MQTT test - listening for commands\"}";
    
    bool publishResult = mqttClient.publish(topic_status.c_str(), testPayload.c_str());
    
    Serial.println("🧪 Test publish to '" + topic_status + "': " + String(publishResult ? "SUCCESS" : "FAILED"));
    Serial.println("🧪 Payload: " + testPayload);
    Serial.println("🎯 Waiting for commands on: " + topic_commands);
    Serial.println("📡 Backend should publish to: esp32_" + String(DEVICE_ID) + "/commands");
    
    if (publishResult) {
      Serial.println("✅ MQTT publish capability confirmed");
      
      // Test self-subscription by publishing a test command to ourselves
      String selfTestCmd = "{\"command\":\"test\",\"source\":\"self_test\",\"timestamp\":" + String(millis()) + "}";
      Serial.println("🧪 SELF-TEST: Sending test command to ourselves...");
      Serial.println("🧪 Publishing to: " + topic_commands);
      Serial.println("🧪 Test command: " + selfTestCmd);
      
      bool selfTestResult = mqttClient.publish(topic_commands.c_str(), selfTestCmd.c_str());
      Serial.println("🧪 Self-test publish result: " + String(selfTestResult ? "SUCCESS" : "FAILED"));
      
      if (selfTestResult) {
        Serial.println("🧪 If subscription works, we should receive this message in ~1 second");
      }
      
    } else {
      Serial.println("❌ MQTT publish failed - connection issues");
    }
  } else {
    Serial.println("❌ MQTT not connected - cannot test publishing");
    Serial.println("🔄 Connection will be attempted in main loop");
  }
  
  Serial.println("=== END MQTT TEST ===\n");
}