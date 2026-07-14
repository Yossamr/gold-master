import re

file_path = 'components/BarcodeScanner.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the extra };
content = content.replace(
'''          qrbox: (width: number, height: number) => {
            const size = Math.min(width, height) * 0.75;
            return { width: size, height: size };
          };
          },''', 
'''          qrbox: (width: number, height: number) => {
            const size = Math.min(width, height) * 0.75;
            return { width: size, height: size };
          },'''
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
