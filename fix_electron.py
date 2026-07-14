import re

file_path = 'electron-main.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
'''    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false 
    }''',
'''    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true 
    }'''
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
