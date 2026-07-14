import re

file_path = 'components/BarcodeScanner.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix decodedText handling
content = re.sub(
    r'\(decodedText\)\s*=>\s*\{\s*if\s*\(decodedText\s*&&\s*isMounted\s*&&\s*!isStopping\)\s*\{',
    r'(decodedText) => {\n              const code = decodedText?.trim();\n              if (code && isMounted && !isStopping) {\n                decodedText = code;',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
