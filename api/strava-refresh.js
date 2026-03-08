const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
            return res.status(500).json({ error: 'Strava is not configured' });
        }

        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({ error: 'Missing refresh token' });
        }

        const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: STRAVA_CLIENT_ID,
                client_secret: STRAVA_CLIENT_SECRET,
                refresh_token: refresh_token,
                grant_type: 'refresh_token'
            })
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.text();
            console.error('Strava refresh error:', error);
            return res.status(400).json({ error: 'Failed to refresh token' });
        }

        const tokenData = await tokenResponse.json();
        return res.status(200).json(tokenData);

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
