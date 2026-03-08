const crypto = require('crypto');
const https = require('https');

const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY || '04ad720c-7dca-4bad-b288-3b33a49ebf62';
const SECRET_KEY = process.env.COUPANG_SECRET_KEY || 'fc5c218a033da0efac9204102513a70438af068b';

function generateHmac(method, url, secretKey, accessKey) {
    const parts = url.split('?');
    const path = parts[0];
    const query = parts[1] || '';
    const d = new Date();
    const pad = (n) => (n < 10 ? '0' + n : n);
    const datetime = d.getUTCFullYear().toString().substring(2, 4) +
        pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
        pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
    const message = datetime + method + path + (query ? '?' + query : '');
    const signature = crypto.createHmac('sha256', secretKey).update(message).digest('hex');
    return 'CEA algorithm=HmacSHA256, access-key=' + accessKey + ', signed-date=' + datetime + ', signature=' + signature;
}

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    const method = 'GET';
    const endpoint = '/v2/providers/affiliate_open_api/apis/openapi/products/bestcategories/1001?limit=3';

    try {
        const authHeader = generateHmac(method, endpoint, SECRET_KEY, ACCESS_KEY);
        const options = {
            hostname: 'api-gateway.coupang.com',
            port: 443,
            path: endpoint,
            method: method,
            headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
        };
        const coupangReq = https.request(options, (coupangRes) => {
            let data = '';
            coupangRes.on('data', (chunk) => { data += chunk; });
            coupangRes.on('end', () => {
                try { res.status(200).json(JSON.parse(data)); }
                catch (err) { res.status(500).json({ error: 'Parse error' }); }
            });
        });
        coupangReq.on('error', (error) => { res.status(500).json({ error: error.message }); });
        coupangReq.end();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
