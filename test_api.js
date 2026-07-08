const http = require('http');
const data = JSON.stringify({ message: 'Test custom order: I want a pink rose bouquet with 12 roses' });
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/whatsapp',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
};
const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => console.log('Response:', body));
});
req.write(data);
req.end();
