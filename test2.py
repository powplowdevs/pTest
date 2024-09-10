from flask import Flask, request, Response
import requests
from urllib.parse import urljoin

app = Flask(__name__)

# The base URL of the site you want to proxy
BASE_URL = 'https://coolmathgames.com'
PROX_URL = 'https://vigilant-telegram-gpq4p9r5ggwc7x5-5000.app.github.dev'

# Helper function to replace URLs in the HTML to go through the proxy
def replace_urls(content, base_url):
    return content.replace('href="', f'href="{base_url}/').replace('src="', f'src="{base_url}/').replace("//", "/").replace("https:/", "https://").replace("http:/", "http://")

# Route to catch all requests
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def proxy(path):
    # Construct the full URL
    target_url = urljoin(BASE_URL, path)
    if path != "" and not "https://" in path and not "http://" in path:
        target_url = PROX_URL + "/" + urljoin(BASE_URL, path)
        print("target url: ", target_url, "base url: ", BASE_URL, " path", path)
    # Forward the request to the target URL
    if request.method == 'GET':
        response = requests.get(target_url)
    elif request.method == 'POST':
        response = requests.post(target_url, data=request.form)
    
    # Modify the content (HTML, CSS, JS) to make it work through the proxy
    content_type = response.headers.get('Content-Type')
    
    if 'text/html' in content_type:
        modified_content = replace_urls(response.text, PROX_URL)
        #print(modified_content)
        return Response(modified_content, content_type=content_type)
    
    # For non-HTML content, just forward it as-is
    return Response(response.content, content_type=content_type)

if __name__ == '__main__':
    app.run(debug=True)

