/*
 * ESP32 Plant Monitor - Intelligent Greenhouse System
 * 
 * IMPORTANT: This sketch requires the ESP32Servo library for servo control:
 * 1. Go to Arduino IDE > Sketch > Include Library > Manage Libraries
 * 2. Search for "ESP32Servo" by Kevin Harrington
 * 3. Install the ESP32Servo library
 * 
 * The standard Arduino Servo library does NOT work with ESP32.
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <ESP32Servo.h>

// WiFi Configuration
const char* ssid = "realme 10 Pro 5G";
const char* password = "z2padqiy";

// MQTT Configuration
const char* mqtt_broker = "10.152.18.213";
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
#define SOIL_LED_PIN 19
#define HUMIDITY_LED_PIN 21
#define TEMP_LED_PIN 22
#define LIGHT_LED_PIN 23

// Servo Configuration
#define SERVO_PIN 18
Servo servo; // ESP32Servo library instance

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

// ---------------------------------------------------
// Setup
// ---------------------------------------------------
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
  pinMode(SOIL_LED_PIN, OUTPUT);
  pinMode(HUMIDITY_LED_PIN, OUTPUT);
  pinMode(TEMP_LED_PIN, OUTPUT);
  pinMode(LIGHT_LED_PIN, OUTPUT);

  // Initialize servo
  servo.attach(SERVO_PIN);
  servo.write(90); // Start at center position

  // Turn off all LEDs initially
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

// ---------------------------------------------------
// Sensor Read Functions
// ---------------------------------------------------
float readTemperature() {
  float t = dht.readTemperature();
  
  // Try reading multiple times if first attempt fails
  if (isnan(t)) {
    delay(100);
    t = dht.readTemperature();
    if (isnan(t)) {
      Serial.println("⚠️ DHT22 Temperature reading failed");
      return -1;
    }
  }
  
  if (t < thresholds.temperature.ideal_min || t > thresholds.temperature.ideal_max) {
    digitalWrite(TEMP_LED_PIN, HIGH);
  } else {
    digitalWrite(TEMP_LED_PIN, LOW);
  }
  return t;
}

float readHumidity() {
  float h = dht.readHumidity();
  
  // Try reading multiple times if first attempt fails
  if (isnan(h)) {
    delay(100);
    h = dht.readHumidity();
    if (isnan(h)) {
      Serial.println("⚠️ DHT22 Humidity reading failed");
      return -1;
    }
  }
  
  if (h < thresholds.humidity.ideal_min || h > thresholds.humidity.ideal_max) {
    digitalWrite(HUMIDITY_LED_PIN, HIGH);
  } else {
    digitalWrite(HUMIDITY_LED_PIN, LOW);
  }
  return h;
}

int readSoilMoisture() {
  int rawValue = analogRead(SOIL_PIN);
  int percentage = map(rawValue, DRY_VALUE, WET_VALUE, 0, 100);
  percentage = constrain(percentage, 0, 100);
  
  if (percentage < thresholds.soil_moisture.ideal_min || percentage > thresholds.soil_moisture.ideal_max) {
    digitalWrite(SOIL_LED_PIN, HIGH);
  } else {
    digitalWrite(SOIL_LED_PIN, LOW);
  }
  
  return percentage;
}

int readLDR() {
  int rawValue = analogRead(LDR_PIN);
  int lightPercent = map(rawValue, LDR_LIGHT, LDR_DARK, 100, 0);
  lightPercent = constrain(lightPercent, 0, 100);

  // Debug: Print light sensor values
  Serial.printf("🔍 Light Debug - Raw: %d, Percent: %d%%, Threshold: %.1f-%.1f\n", 
                rawValue, lightPercent, thresholds.light.ideal_min, thresholds.light.ideal_max);

  // Servo + LED control based on thresholds
  if (lightPercent < thresholds.light.ideal_min) {
    // Too dark - open shade (servo to 0)
    Serial.println("🌑 Too dark - Opening shade (servo to 0°)");
    servo.write(0);
    digitalWrite(LIGHT_LED_PIN, HIGH);
    delay(100); // Give servo time to start moving
  } else if (lightPercent > thresholds.light.ideal_max) {
    // Too bright - close shade (servo to 180)
    Serial.println("☀️ Too bright - Closing shade (servo to 180°)");
    servo.write(180);
    digitalWrite(LIGHT_LED_PIN, LOW);
    delay(100); // Give servo time to start moving
  } else {
    // Optimal - center position
    Serial.println("✅ Light optimal - Center position (servo to 90°)");
    servo.write(90);
    digitalWrite(LIGHT_LED_PIN, LOW);
    delay(100); // Give servo time to start moving
  }

  return lightPercent;
}

// ---------------------------------------------------
// Threshold Persistence
// ---------------------------------------------------
void loadThresholdsFromMemory() {
  if (preferences.isKey("thresholds")) {
    preferences.getBytes("thresholds", &thresholds, sizeof(thresholds));
    thresholdsFromDashboard = true;
  }
}

void saveThresholdsToMemory() {
  preferences.putBytes("thresholds", &thresholds, sizeof(thresholds));
}

// ---------------------------------------------------
// MQTT Handling
// ---------------------------------------------------
void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';
  String message = String((char*)payload);
  Serial.println("📨 MQTT Message received [" + String(topic) + "]: " + message);
  
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, message);
  if (error) {
    Serial.println("❌ JSON Parse Failed: " + String(error.c_str()));
    return;
  }

  // Handle threshold updates
  if (doc.containsKey("thresholds")) {
    Serial.println("🔄 Processing threshold update...");
    
    // Check if this is a command with thresholds
    if (doc.containsKey("command") && doc["command"] == "update_thresholds") {
      Serial.println("📋 Command: update_thresholds");
      if (doc.containsKey("plant_name")) {
        Serial.println("🌱 Plant: " + String(doc["plant_name"].as<const char*>()));
      }
    }
    
    // Update thresholds
    if (doc["thresholds"].containsKey("temperature")) {
      thresholds.temperature.ideal_min = doc["thresholds"]["temperature"]["min"];
      thresholds.temperature.ideal_max = doc["thresholds"]["temperature"]["max"];
      Serial.printf("🌡️ Temperature thresholds: %.1f - %.1f°C\n", 
                   thresholds.temperature.ideal_min, thresholds.temperature.ideal_max);
    }
    
    if (doc["thresholds"].containsKey("humidity")) {
      thresholds.humidity.ideal_min = doc["thresholds"]["humidity"]["min"];
      thresholds.humidity.ideal_max = doc["thresholds"]["humidity"]["max"];
      Serial.printf("💧 Humidity thresholds: %.1f - %.1f%%\n", 
                   thresholds.humidity.ideal_min, thresholds.humidity.ideal_max);
    }
    
    if (doc["thresholds"].containsKey("soil_moisture")) {
      thresholds.soil_moisture.ideal_min = doc["thresholds"]["soil_moisture"]["min"];
      thresholds.soil_moisture.ideal_max = doc["thresholds"]["soil_moisture"]["max"];
      Serial.printf("🌱 Soil moisture thresholds: %.1f - %.1f%%\n", 
                   thresholds.soil_moisture.ideal_min, thresholds.soil_moisture.ideal_max);
    }
    
    if (doc["thresholds"].containsKey("light")) {
      thresholds.light.ideal_min = doc["thresholds"]["light"]["min"];
      thresholds.light.ideal_max = doc["thresholds"]["light"]["max"];
      Serial.printf("☀️ Light thresholds: %.1f - %.1f\n", 
                   thresholds.light.ideal_min, thresholds.light.ideal_max);
    }
    
    thresholdsFromDashboard = true;
    saveThresholdsToMemory();
    
    Serial.println("✅ Thresholds updated from dashboard and saved to memory.");
    Serial.println("📋 New thresholds:");
    printCurrentThresholds();
    
    // Send acknowledgment back
    StaticJsonDocument<128> ackDoc;
    ackDoc["status"] = "thresholds_updated";
    ackDoc["device_id"] = DEVICE_ID;
    ackDoc["timestamp"] = millis();
    
    char ackBuffer[128];
    serializeJson(ackDoc, ackBuffer);
    mqttClient.publish(topic_status.c_str(), ackBuffer);
    Serial.println("📤 Acknowledgment sent to: " + topic_status);
  }
  
  // Handle other commands
  else if (doc.containsKey("command")) {
    String command = doc["command"];
    Serial.println("📋 Received command: " + command);
    
    if (command == "ping" || command == "test") {
      // Respond to ping/test commands
      StaticJsonDocument<128> responseDoc;
      responseDoc["status"] = "online";
      responseDoc["device_id"] = DEVICE_ID;
      responseDoc["command_received"] = command;
      responseDoc["timestamp"] = millis();
      
      char responseBuffer[128];
      serializeJson(responseDoc, responseBuffer);
      mqttClient.publish(topic_status.c_str(), responseBuffer);
      Serial.println("📤 Test response sent");
    }
  }
}

void reconnect() {
  while (!mqttClient.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32_Client_" + String(DEVICE_ID) + "_" + String(WiFi.macAddress());
    
    // Add connection timeout and retry logic
    mqttClient.setKeepAlive(60);
    mqttClient.setSocketTimeout(30);
    
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("connected");
      mqttClient.subscribe(topic_commands.c_str());
      mqttClient.publish(topic_status.c_str(), "Device reconnected");
      Serial.println("✅ MQTT Connected successfully!");
      Serial.println("📺 Subscribed to: " + topic_commands);
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 5 seconds");
      
      // Print more detailed error information
      switch(mqttClient.state()) {
        case -4:
          Serial.println("❌ MQTT_CONNECTION_TIMEOUT - Cannot reach broker");
          Serial.println("🔍 Check if broker IP 10.152.18.213 is correct and accessible");
          break;
        case -3:
          Serial.println("❌ MQTT_CONNECTION_LOST");
          break;
        case -2:
          Serial.println("❌ MQTT_CONNECT_FAILED");
          break;
        case -1:
          Serial.println("❌ MQTT_DISCONNECTED");
          break;
        case 1:
          Serial.println("❌ MQTT_CONNECT_BAD_PROTOCOL");
          break;
        case 2:
          Serial.println("❌ MQTT_CONNECT_BAD_CLIENT_ID");
          break;
        case 3:
          Serial.println("❌ MQTT_CONNECT_UNAVAILABLE");
          break;
        case 4:
          Serial.println("❌ MQTT_CONNECT_BAD_CREDENTIALS");
          break;
        case 5:
          Serial.println("❌ MQTT_CONNECT_UNAUTHORIZED");
          break;
      }
      
      delay(5000);
    }
  }
}

// ---------------------------------------------------
// Debug Print
// ---------------------------------------------------
void printCurrentThresholds() {
  Serial.println("=== Current Thresholds ===");
  Serial.printf("Temperature: %.1f - %.1f °C\n", thresholds.temperature.ideal_min, thresholds.temperature.ideal_max);
  Serial.printf("Humidity: %.1f - %.1f %%\n", thresholds.humidity.ideal_min, thresholds.humidity.ideal_max);
  Serial.printf("Soil Moisture: %.1f - %.1f %%\n", thresholds.soil_moisture.ideal_min, thresholds.soil_moisture.ideal_max);
  Serial.printf("Light: %.1f - %.1f\n", thresholds.light.ideal_min, thresholds.light.ideal_max);
}

// ---------------------------------------------------
// Loop
// ---------------------------------------------------
void loop() {
  if (!mqttClient.connected()) {
    reconnect();
  }
  mqttClient.loop();

  unsigned long now = millis();

  // Sensor data every 5s
  if (now - lastPublish > 5000) {
    lastPublish = now;

    Serial.println("📊 Reading sensors...");
    
    float temp = readTemperature();
    float hum = readHumidity();
    int soil = readSoilMoisture();
    int light = readLDR();
    
    // Debug: Print all sensor readings
    Serial.printf("🌡️ Temperature: %.2f°C\n", temp);
    Serial.printf("💧 Humidity: %.2f%%\n", hum);
    Serial.printf("🌱 Soil Moisture: %d%%\n", soil);
    Serial.printf("☀️ Light: %d\n", light);
    
    // Publish individual sensor readings regardless of DHT status
    // Temperature
    if (temp != -1) {
      bool tempPublished = mqttClient.publish(topic_temperature.c_str(), String(temp).c_str());
      Serial.printf("📤 Temperature published: %s (success: %d)\n", String(temp).c_str(), tempPublished);
    } else {
      Serial.println("❌ Temperature reading failed");
    }
    
    // Humidity
    if (hum != -1) {
      bool humPublished = mqttClient.publish(topic_humidity.c_str(), String(hum).c_str());
      Serial.printf("📤 Humidity published: %s (success: %d)\n", String(hum).c_str(), humPublished);
    } else {
      Serial.println("❌ Humidity reading failed");
    }
    
    // Soil moisture (always publish as it doesn't depend on DHT)
    bool soilPublished = mqttClient.publish(topic_soil.c_str(), String(soil).c_str());
    Serial.printf("📤 Soil Moisture published: %s (success: %d)\n", String(soil).c_str(), soilPublished);
    
    // Light (always publish)
    bool lightPublished = mqttClient.publish(topic_light.c_str(), String(light).c_str());
    Serial.printf("📤 Light published: %s (success: %d)\n", String(light).c_str(), lightPublished);
    
    // Create combined JSON for debugging
    StaticJsonDocument<256> doc;
    doc["device_id"] = DEVICE_ID;
    doc["temperature"] = (temp != -1) ? temp : 0;
    doc["humidity"] = (hum != -1) ? hum : 0;
    doc["soil_moisture"] = soil;
    doc["light"] = light;
    doc["timestamp"] = now;
    
    char buffer[256];
    size_t n = serializeJson(doc, buffer);
    bool combinedPublished = mqttClient.publish(("esp32_" + String(DEVICE_ID) + "/data").c_str(), buffer, n);
    Serial.printf("📤 Combined data published (success: %d): %s\n", combinedPublished, buffer);
    
    Serial.println("---");
  }

  // Status update every 30s
  if (now - lastStatusUpdate > 30000) {
    lastStatusUpdate = now;
    bool statusPublished = mqttClient.publish(topic_status.c_str(), "Device online");
    Serial.printf("📤 Status published (success: %d)\n", statusPublished);
  }
}
