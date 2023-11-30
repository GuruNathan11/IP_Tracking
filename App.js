const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json());

// Middleware to get client's IP address and fetch information
app.use('/api/get', (req, res, next) => {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Extract the IPv4 address from the IPv6-mapped format
  const ipv4Address = clientIp.includes('::ffff:') ? clientIp.split('::ffff:')[1] : clientIp;

  axios.get(`https://ipinfo.io/${ipv4Address}/json`)
    .then(response => {
      req.ipInfo = response.data;
      next();
    })
    .catch(error => {
      console.error('Error fetching IP information:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

// Route to handle "/api/get" and send the response data
app.get('/api/get', (req, res) => {
  const data = req.ipInfo || {}; // Use an empty object if req.ipInfo is not available

  res.json({
    IPv4: data.ip,
    IPv6: 'Checking...',
    'IP LOCATION': `${data.city || 'Unknown'}, ${data.region || 'Unknown'} (${data.country || 'Unknown'})`,
    ISP: data.org || 'Unknown',
    'PROXY': data.proxy ? 'Detected' : 'Not Detected',
    PLATFORM: data.platform || 'N/A',
    BROWSER: data.browser || 'N/A',
    'SCREEN SIZE': `${data.screenWidth || 'Unknown'}px X ${data.screenHeight || 'Unknown'}px`,
    JAVASCRIPT: data.js ? 'Enabled' : 'Disabled',
    COOKIE: data.cookies ? 'Enabled' : 'Disabled',
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
