// Simple API test
const http = require('http');

const testAPI = async () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3003/api/sensors', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Response status:', res.statusCode);
        console.log('Response data:', data);
        resolve(data);
      });
    });

    req.on('error', (err) => {
      console.error('Error:', err.message);
      reject(err);
    });

    req.setTimeout(5000, () => {
      console.error('Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

testAPI().catch(console.error);
