const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const morgan = require('morgan');
const dns = require('dns');
const bodyParser = require('body-parser');
const path = require('path');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 2012;

//let targetSite = 'https://jchabin.github.io/cars/editor/'
//let targetSite = 'https://drawandguess.io/';
//let targetSite = 'https://territorial.io/';
//let targetSite = 'https://12minibattles.github.io/';
//let targetSite = 'https://buildnow-gg.io/';
let targetSite = 'https://jchabin.github.io/cars/';
//let targetSite = 'https://slowroads.io/';
//let targetSite = 'https://play2048.co/';
//let targetSite = 'https://2048.ee/doge/';
//let targetSite = 'https://supermario.ee/';
//let targetSite = "https://rooftop-snipers.io/";
//let targetSite = 'https://geometry-dash.me/';
//"cookie clicker";

app.use(morgan('dev'));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
//app.use(express.static(path.join(__dirname, 'public')));

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

// Handle incoming target URL changes
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

// Proxy requests to the target site
app.use('/', createProxyMiddleware({
    target: targetSite,
    changeOrigin: true,
    pathRewrite: {
        '^/': '', 
    },
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36');
        proxyReq.setHeader('Referer', 'https://www.google.com/');
        proxyReq.setHeader('Host', new URL(targetSite).host);
        console.log(`Proxying request to: ${targetSite}${req.url}`);
    },
    logLevel: 'debug',
    agent: httpsAgent,
}));

app.get('/', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});
