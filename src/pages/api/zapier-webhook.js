export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Forward the request to Zapier webhook
    const zapierResponse = await fetch('https://hooks.zapier.com/hooks/catch/23995235/u4ms15h/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    const zapierData = await zapierResponse.json();

    if (zapierResponse.ok) {
      console.log('Successfully forwarded to Zapier:', req.body);
      res.status(200).json({ success: true, zapierResponse: zapierData });
    } else {
      console.error('Zapier webhook failed:', zapierResponse.status, zapierData);
      res.status(zapierResponse.status).json({ error: 'Zapier webhook failed', details: zapierData });
    }
  } catch (error) {
    console.error('Failed to forward to Zapier:', error);
    res.status(500).json({ error: 'Failed to forward request to Zapier' });
  }
} 