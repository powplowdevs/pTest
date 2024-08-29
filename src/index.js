const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const https = require('https');
const morgan = require('morgan');
const dns = require('dns');
const { createGunzip } = require('zlib');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 6067;

let targetSite = 'https://slowroads.io/'
//'https://play2048.co/'
//'//https://2048.ee/doge/'
//'https://supermario.ee/'
//"https://rooftop-snipers.io/"
//'https://geometry-dash.me/';
//"cookie cliker"
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

function editUrls(responseBuffer, proxyRes, req, res) {
    const contentType = proxyRes.headers['content-type'];
    console.log("begin edit: ", contentType)
    console.log("rb: ", responseBuffer)
    console.log("pr: ", proxyRes)
    console.log("req: ", req)
    if (contentType && contentType.includes('text/html')) {
        let body = responseBuffer.toString('utf8');
        
        // Replace all relative and absolute URLs with the proxied path
        const baseUrl = `${req.protocol}://${req.headers.host}`;
        body = body.replace(/href="(\/[^"]*)"/g, `href="${baseUrl}$1"`);
        body = body.replace(/src="(\/[^"]*)"/g, `src="${baseUrl}$1"`);
        body = body.replace(/action="(\/[^"]*)"/g, `action="${baseUrl}$1"`);
        console.log("editing URLS")
        
        body = body.replace(new RegExp(targetSite, 'g'), baseUrl);

        return body;
    }

    return responseBuffer;
}

app.use(morgan('dev'));

app.use('/', createProxyMiddleware({
    target: targetSite,
    changeOrigin: true,
    // secure: true,
    // agent: httpsAgent,
    // selfHandleResponse: true,
    //on: { proxyReq: editUrls},
    onProxyReq: (proxyReq, req, res) => {
        // Modify headers to mask the request
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36');
        proxyReq.setHeader('Referer', 'https://www.google.com/');
        proxyReq.setHeader('Host', new URL(targetSite).host);
        proxyReq.setHeader('content-type', 'text/html')
        console.log(`Proxying request to: ${req.url}`);
        console.log("proxy made")
    },
    pathRewrite: {
        '^/': '/',
    },
    logLevel: 'debug',
}));

app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});