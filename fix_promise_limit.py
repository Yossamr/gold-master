import os
import re

file_path = 'node_modules/promise-limit/index.js'
if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'export default ' not in content:
        content += "\nexport default module.exports;\n"
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Patched promise-limit")
    else:
        print("Already patched")
else:
    print("promise-limit not found")
