const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json());

// Middleware to get public IP address and fetch information
app.use('/api/get', (req, res, next) => {
  axios.get('https://api64.ipify.org?format=json')
    .then(ipifyResponse => {
      const publicIpAddress = ipifyResponse.data.ip;

      if (publicIpAddress) {
        axios.get(`https://ipinfo.io/${publicIpAddress}/json`)
          .then(response => {
            req.ipInfo = response.data;
            next();
          })
          .catch(error => {
            console.error('Error fetching IP information:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
          });
      } else {
        console.error('Public IP address not available.');
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })
    .catch(error => {
      console.error('Error fetching public IP address:', error.message);
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
    // PLATFORM: data.platform || 'N/A',
    // BROWSER: data.browser || 'N/A',
    // 'SCREEN SIZE': `${data.screenWidth || 'Unknown'}px X ${data.screenHeight || 'Unknown'}px`,
    // JAVASCRIPT: data.js ? 'Enabled' : 'Disabled',
    COOKIE: data.cookies ? 'Enabled' : 'Disabled',
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
