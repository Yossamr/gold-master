import re

file_path = 'services/auth.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import argon2 from 'argon2-browser';", "import argon2 from 'argon2-browser/dist/argon2-bundled.min.js';")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
