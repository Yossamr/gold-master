import re

file_path = 'vite.config.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "server:" not in content:
    content = content.replace("export default defineConfig({", "export default defineConfig({\n  server: {\n    host: '0.0.0.0',\n    port: 3000,\n    strictPort: true,\n  },")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
