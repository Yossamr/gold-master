import os
import re

file_path = 'services/storage.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix logo-container css
css_old_logo_container = """.logo-container {
                 width: 100%;
                 display: flex;
                 justify-content: center;
                 align-items: center;
                 margin-bottom: 1px;
             }"""
css_new_logo_container = """.logo-container {
                 width: 100%;
                 display: flex;
                 flex-direction: column;
                 justify-content: center;
                 align-items: center;
                 margin-bottom: 1px;
             }"""

if css_old_logo_container in content:
    content = content.replace(css_old_logo_container, css_new_logo_container)
elif css_old_logo_container.replace('\n', '\r\n') in content:
    content = content.replace(css_old_logo_container.replace('\n', '\r\n'), css_new_logo_container.replace('\n', '\r\n'))

# Ensure logo heights are reasonable so they don't overflow
# Currently shop-logo-img is 0.6cm in inline style. Let's make it max-height 0.4cm.
content = content.replace('style="max-height: 0.6cm;"', 'style="max-height: 0.45cm;"')
content = content.replace('max-height: 0.55cm;', 'max-height: 0.45cm;')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
