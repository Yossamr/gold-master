import os
import re

file_path = 'services/storage.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace top-half and bottom-half CSS
content = re.sub(r'\.top-half\s*\{[^}]*\}', """.top-half {
                 justify-content: center;
                 padding-bottom: 1px;
             }""", content)

content = re.sub(r'\.bottom-half\s*\{[^}]*\}', """.bottom-half {
                 justify-content: center;
                 padding-top: 1px;
             }""", content)

# Replace logo-container-top and elements
content = re.sub(r'\.logo-container-top\s*\{[^}]*\}', """.logo-container-top {
                 width: 100%;
                 display: flex;
                 flex-direction: column;
                 justify-content: center;
                 align-items: center;
                 margin-bottom: 0px;
                 margin-top: 0px;
             }""", content)

content = re.sub(r'\.shop-logo-img-top\s*\{[^}]*\}', """.shop-logo-img-top {
                 max-height: 0.32cm;
                 max-width: 90%;
                 object-fit: contain;
             }""", content)

content = re.sub(r'\.tag-shop-name-top\s*\{[^}]*\}', """.tag-shop-name-top {
                  font-size: 5.5px;
                  font-weight: 900;
                  color: #000000;
                  text-align: center;
                  margin-top: 1px;
                  margin-bottom: 0px;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  width: 95%;
             }""", content)

# Replace qr-canvas and code-text
content = re.sub(r'\.qr-canvas\s*\{[^}]*\}', """.qr-canvas {
                 max-width: 0.62cm !important;
                 max-height: 0.62cm !important;
                 object-fit: contain !important;
                 margin-top: 1px;
                 margin-bottom: 1px;
             }""", content)

content = re.sub(r'\.code-text\s*\{[^}]*\}', """.code-text {
                 font-size: 6px;
                 font-family: monospace;
                 color: #0f172a;
                 font-weight: bold;
                 margin-top: 0px;
             }""", content)

# Replace logo-container and elements
content = re.sub(r'\.logo-container\s*\{[^}]*\}', """.logo-container {
                 width: 100%;
                 display: flex;
                 flex-direction: column;
                 justify-content: center;
                 align-items: center;
                 margin-bottom: 1px;
             }""", content)

content = re.sub(r'\.shop-logo-img\s*\{[^}]*\}', """.shop-logo-img {
                 max-height: 0.38cm;
                 max-width: 90%;
                 object-fit: contain;
             }""", content)

content = re.sub(r'\.tag-shop-name\s*\{[^}]*\}', """.tag-shop-name {
                  font-size: 7.5px;
                  font-weight: 900;
                  color: #000000;
                  margin-top: 1px;
                  margin-bottom: 1.5px;
                  letter-spacing: 0.3px;
                  text-align: center;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  width: 95%;
             }""", content)

# Replace tag-row and tag-title
content = re.sub(r'\.tag-row\s*\{[^}]*\}', """.tag-row {
                  margin: 0.5px 0px;
                  font-size: 6px;
                  line-height: 1.1;
                  color: #334155;
                  white-space: nowrap;
                  font-weight: bold;
             }""", content)

content = re.sub(r'\.tag-title\s*\{[^}]*\}', """.tag-title {
                  font-size: 6.5px;
                  font-weight: 900;
                  color: #0f172a;
                  margin-bottom: 1px;
                  text-align: center;
             }""", content)

# Replace inline styles in HTML
content = content.replace('style="max-height: 0.45cm;"', '')
content = content.replace('style="max-height: 0.6cm;"', '')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

