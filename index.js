const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add response headers for CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Endpoint to handle the request
app.post('/api/retrieve', async (req, res) => {
  const { phoneNumber } = req.body;

  console.log('Received Request with Phone Number:', phoneNumber);

  // Verify the input
  if (!phoneNumber || phoneNumber.length < 9 || phoneNumber.length > 10) {
    console.error('Invalid Phone Number:', phoneNumber);
    return res.status(400).json({ error: 'Invalid phone number entered' });
  }

  const externalApiUrl = 'https://paiement.algerietelecom.dz/AndroidApp/dette_paiement.php';
  const requestData = `ndco20=${phoneNumber}&validerco20=Confirmer&nfactco20=`;

  try {
    console.log('Sending Request to External API...');
    const externalApiResponse = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic VEdkNzJyOTozUjcjd2FiRHNfSGpDNzg3IQ==',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: requestData,
    });

    console.log('Received Response Status from External API:', externalApiResponse.status);

    if (!externalApiResponse.ok) {
      console.error('Error Response from External API:', externalApiResponse.statusText);
      return res.status(502).json({ error: 'Failed to contact external service' });
    }

    const data = await externalApiResponse.json();

    console.log('External API Response Body:', data);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error Communicating with External API:', error.message);
    res.status(500).json({ error: 'Connection to external API failed' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend proxy running at http://localhost:${PORT}`);
});
