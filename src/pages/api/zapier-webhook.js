export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Determine which webhook URL to use based on the request type
    let zapierUrl;
    if (req.body.type === 'room-action') {
      zapierUrl = process.env.ZAPIER_WEBHOOK_URL;
    } else if (req.body.type === 'room-state') {
      zapierUrl = process.env.ZAPIER_ROOM_STATE_WEBHOOK_URL;
    }
    
    if (!zapierUrl) {
      const missingVar = req.body.type === 'room-action' ? 'ZAPIER_WEBHOOK_URL' : 'ZAPIER_ROOM_STATE_WEBHOOK_URL';
      console.error(`${missingVar} environment variable is not set`);
      return res.status(500).json({ error: `${missingVar} not configured` });
    }

    // Forward the request to Zapier webhook
    const zapierResponse = await fetch(zapierUrl, {
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