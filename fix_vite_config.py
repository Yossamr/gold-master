import re
file_path = 'vite.config.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'\s*optimizeDeps: \{\s*exclude: \[\'@libsql/client\'\],\s*\},', '', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
