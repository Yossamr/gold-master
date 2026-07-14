import re

file_path = 'components/BarcodeScanner.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add DATA_MATRIX
content = content.replace('Html5QrcodeSupportedFormats.QR_CODE', 'Html5QrcodeSupportedFormats.QR_CODE,\n            Html5QrcodeSupportedFormats.DATA_MATRIX')

# Update qrbox to a square that accommodates both
content = re.sub(
    r'qrbox:\s*\(\w+:\s*number,\s*\w+:\s*number\)\s*=>\s*\{.*?\}',
    r'''qrbox: (width: number, height: number) => {
            const size = Math.min(width, height) * 0.75;
            return { width: size, height: size };
          }''',
    content,
    flags=re.DOTALL
)

# Update visual guide rectangle to square
content = content.replace('className="relative w-72 h-40"', 'className="relative w-64 h-64"')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
