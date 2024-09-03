const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const morgan = require('morgan');
const dns = require('dns');
const bodyParser = require('body-parser');
const path = require('path');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 3050;

let targetSite = 'https://example.com';
//'https://territorial.io/';
//'https://12minibattles.github.io/';
//'https://buildnow-gg.io/';
//'https://jchabin.github.io/cars/';
//'https://slowroads.io/';
//'https://play2048.co/';
//'https://2048.ee/doge/';
//'https://supermario.ee/';
//"https://rooftop-snipers.io/";
//'https://geometry-dash.me/';
//"cookie clicker";

app.use(morgan('dev'));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

//Handle incoming target URL changes
app.post('/setTarget', (req, res) => {
    const newTarget = req.body.url;
    console.log("Setting new target URL:", newTarget);
    if (newTarget) {
        targetSite = newTarget;
        res.json({ success: true, targetSite });
    } else {
        res.json({ success: false, message: 'No URL provided' });
    }
});

//Middleware to create the proxy middleware dynamically
app.use('/proxy', (req, res, next) => {
    createProxyMiddleware({
        target: targetSite,
        changeOrigin: true,
        pathRewrite: {
            '^/proxy': '/',
        },
        onProxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0');
            proxyReq.setHeader('Referer', 'https://www.google.com/');
            proxyReq.setHeader('Host', new URL(targetSite).host);
            console.log(`Proxying request to: ${req.url}`);
        },
        logLevel: 'debug',
        agent: httpsAgent,
    })(req, res, next);
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});