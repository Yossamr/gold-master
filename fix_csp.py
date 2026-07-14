import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

csp_meta = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com; img-src \'self\' data: blob: https://*; connect-src \'self\' https://* wss://*; frame-src \'self\'">'

if "Content-Security-Policy" not in content:
    content = content.replace("<head>", "<head>\n    " + csp_meta)
    
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
