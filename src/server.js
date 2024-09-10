const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const morgan = require('morgan');
const dns = require('dns');
const bodyParser = require('body-parser');
const path = require('path');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 2037;

//let targetSite = 'https://www.friv.com/z/games/fireboyandwatergirlforest/game.html'
//let targetSite = 'https://jchabin.github.io/cars/editor/'
//let targetSite = 'https://drawandguess.io/';
let targetSite = 'https://iogames.onl/wings-io'
//let targetSite = 'https://territorial.io/';
//let targetSite = 'https://12minibattles.github.io/';
//let targetSite = 'https://buildnow-gg.io/';
//let targetSite = 'https://jchabin.github.io/cars/';
//let targetSite = 'https://slowroads.io/';
//let targetSite = 'https://play2048.co/';
//let targetSite = 'https://2048.ee/doge/';
//let targetSite = 'https://supermario.ee/';
//let targetSite = "https://rooftop-snipers.io/";
//let targetSite = 'https://geometry-dash.me/';
//"cookie clicker";

const proxyTable = {
    'integration.localhost:3000': 'http://localhost:8001', // host only
    'staging.localhost:3000': 'http://localhost:8002', // host only
    'localhost:3000/api': 'http://localhost:8003', // host + path
    '/rest': 'http://localhost:8004', // path only
  };
  
app.use(morgan('dev'));
app.use(bodyParser.json());

// app.use(express.static(path.join(__dirname, 'public')));

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

//Change target URL
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

//Proxy requests
app.use('/', createProxyMiddleware({
    target: targetSite,
    changeOrigin: true,
    router: proxyTable,
    pathRewrite: {
        '^/': '',
    },
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36');
        proxyReq.setHeader('Referer', 'https://www.google.com/');
        proxyReq.setHeader('Host', new URL(targetSite).host);
        console.log(`Proxying request to: ${targetSite}${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        let originalBody = '';
        proxyRes.on('data', (chunk) => {
            originalBody += chunk.toString();
        });

        proxyRes.on('end', () => {
            const rewrittenBody = originalBody.replace(/(href|src)=["'](?!http)([^"']*)["']/g, (match, attr, url) => {
                return `${attr}="${req.baseUrl}${url}"`;
            });

            res.setHeader('Content-Type', proxyRes.headers['content-type']);
            res.send(rewrittenBody);
        });
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

