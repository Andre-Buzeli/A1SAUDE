const express = require('express');
const app = express();

app.use(express.json());

app.post('/test', (req, res) => {
  console.log('=== REQUEST RECEIVED ===');
  console.log('Method:', req.method);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Raw body length:', req.rawBody ? req.rawBody.length : 'no rawBody');
  console.log('Parsed body:', req.body);
  console.log('Body type:', typeof req.body);
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('=== END REQUEST ===');
  res.json({ received: req.body, bodyType: typeof req.body });
});

app.listen(5002, () => {
  console.log('Test server running on port 5002');
});
