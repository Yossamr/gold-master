import re

file_path = 'components/BarcodeScanner.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update camera request to ask for high resolution and continuous focus if possible
content = content.replace(
    "{ facingMode: 'environment' }",
    "{ facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
