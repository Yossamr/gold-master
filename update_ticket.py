import re

file_path = 'services/storage.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace top half logic
# For both data1 and data2
old_top_half_pattern = re.compile(r'\$\{store\.logoBase64\s*\?\s*`<div class="logo-container-top">.*?</div>`\s*:\s*`<div class="app-logo">\$\{storeName\}</div>`\s*\}', re.DOTALL)
new_top_half = r'''<div class="app-title-top">Gold Master</div>'''

content = old_top_half_pattern.sub(new_top_half, content)

# Now we need to add the beautiful styles for app-title-top, and improve logo styling in bottom half.
# The user wants "Gold Master" to look awesome.

# Find styles
styles_insertion_point = content.find('.logo-container-top {')

styles_to_insert = """
             .app-title-top {
                 font-family: 'Arial', sans-serif;
                 font-size: 8px;
                 font-weight: 900;
                 color: #000;
                 letter-spacing: 0.5px;
                 text-align: center;
                 text-transform: uppercase;
                 border-bottom: 1px solid #000;
                 padding-bottom: 1px;
                 margin-bottom: 2px;
                 width: 80%;
             }
"""
# Since logo-container-top might be removed or altered, let's just insert styles before .app-logo
content = content.replace('.app-logo {', styles_to_insert + '\n             .app-logo {')

# Improve logo size in bottom half
# Find .shop-logo-img
content = content.replace('max-width: 0.6cm;', 'max-width: 0.8cm;')
content = content.replace('max-height: 0.6cm;', 'max-height: 0.8cm;')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
