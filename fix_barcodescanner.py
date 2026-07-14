import os
import re

file_path = 'components/BarcodeScanner.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove experimental features entirely or set it to false
# because it might be causing issues on some devices for QR codes
if "experimentalFeatures:" in content:
    content = re.sub(r'experimentalFeatures:\s*\{\s*useBarCodeDetectorIfSupported:\s*true\s*\}', 'experimentalFeatures: { useBarCodeDetectorIfSupported: false }', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

