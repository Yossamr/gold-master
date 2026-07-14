import re

file_path = 'services/storage.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update shop-logo-img
content = re.sub(
    r'\.shop-logo-img\s*\{\s*max-height:\s*0\.38cm;\s*max-width:\s*90%;\s*object-fit:\s*contain;\s*\}',
    r'.shop-logo-img {\n                 max-height: 0.55cm;\n                 max-width: 90%;\n                 object-fit: contain;\n                 filter: contrast(1.1);\n             }',
    content
)

# Update tag-shop-name
content = re.sub(
    r'\.tag-shop-name\s*\{\s*font-size:\s*7\.5px;\s*font-weight:\s*900;\s*color:\s*#000000;\s*margin-top:\s*1px;\s*',
    r'.tag-shop-name {\n                  font-size: 8.5px;\n                  font-weight: 900;\n                  color: #000000;\n                  margin-top: 2px;\n                  letter-spacing: 0.2px;\n                  ',
    content
)

# Update app-title-top
content = re.sub(
    r'border-bottom:\s*1px solid #000;\s*padding-bottom:\s*1px;\s*margin-bottom:\s*2px;\s*width:\s*80%;',
    r'border-bottom: 0.5px solid #000;\n                 padding-bottom: 1px;\n                 margin-bottom: 1px;\n                 width: 80%;\n                 font-family: \'Georgia\', serif;',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
