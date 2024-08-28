const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const morgan = require('morgan');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 1423;

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

app.use(morgan('dev'));

app.use('/', createProxyMiddleware({
    target: 'https://www.youtube.com',
    changeOrigin: true,
    secure: true,
    agent: httpsAgent,
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36');
        proxyReq.setHeader('Referer', 'https://www.google.com/');
        proxyReq.setHeader('Host', target);
        console.log(`Proxying request to: ${req.url}`);
    },
    pathRewrite: {
        '^/': '/',
    },
    logLevel: 'debug',
}));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});