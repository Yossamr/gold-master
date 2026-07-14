import re
file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_csp = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://*; style-src \'self\' \'unsafe-inline\' https://*; font-src \'self\' data: https://*; img-src \'self\' data: blob: https://*; connect-src \'self\' https://* wss://* ws://*; frame-src \'self\'">'
content = re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]+>', new_csp, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
