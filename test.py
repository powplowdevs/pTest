from flask import Flask, request, Response
import requests
from urllib.parse import urlparse, urljoin

app = Flask(__name__)

# Base URL for proxy
baseUrl = None

def fetchContent(url, headers={}):
    """Fetch content from URL."""
    response = requests.get(url, headers=headers)
    return response.content, response.headers

def rewriteLinks(html, baseUrl):
    """Rewrite HTML links to go through proxy."""
    html = html.decode('utf-8')
    baseUrl = baseUrl.rstrip('/') + '/'
    proxyBaseUrl = f"http://localhost:8080/proxy?url={baseUrl}"
    
    html = html.replace('href="/', f'href="{proxyBaseUrl}/')
    html = html.replace('src="/', f'src="{proxyBaseUrl}/')
    html = html.replace('href="http://', f'href="{proxyBaseUrl}/')
    html = html.replace('src="http://', f'src="{proxyBaseUrl}/')

    return html.encode('utf-8')

@app.route('/')
def index():
    global baseUrl
    if baseUrl is None:
        return 'Set proxy URL via /proxy?url=<target_url>'
    
    htmlContent, _ = fetchContent(baseUrl)
    htmlContent = rewriteLinks(htmlContent, baseUrl)
    return Response(htmlContent, content_type='text/html')

@app.route('/proxy')
def setProxy():
    global baseUrl
    targetUrl = request.args.get('url')
    if not targetUrl:
        return 'No target URL specified', 400
    baseUrl = targetUrl
    return f'Proxy set to: {targetUrl}'

@app.route('/<path:resource>')
def proxyResource(resource):
    global baseUrl
    if baseUrl is None:
        return 'Set proxy URL via /proxy?url=<target_url>', 400
    
    fullUrl = urljoin(baseUrl, resource)
    headers = {key: value for key, value in request.headers if key.lower() not in ['host', 'connection', 'upgrade-insecure-requests']}
    content, responseHeaders = fetchContent(fullUrl, headers=headers)
    
    contentType = responseHeaders.get('Content-Type', 'text/html')
    if contentType.startswith('text/html'):
        content = rewriteLinks(content, baseUrl)

    return Response(content, content_type=contentType)

def runServer():
    app.run(debug=True, port=8080)

if __name__ == '__main__':
    runServer()
