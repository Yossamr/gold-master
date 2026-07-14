import re

file_path = 'components/BarcodeScanner.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update qrbox config
content = re.sub(
    r'qrbox:\s*\(\w+:\s*number,\s*\w+:\s*number\)\s*=>\s*\{.*?\}(?=,)',
    r'''qrbox: (width: number, height: number) => {
            // Rectangular target box for better 1D barcode detection
            return { width: Math.min(width * 0.9, 400), height: Math.min(height * 0.4, 200) };
          }''',
    content,
    flags=re.DOTALL
)

# Update experimentalFeatures
content = content.replace('useBarCodeDetectorIfSupported: false', 'useBarCodeDetectorIfSupported: true')

# Update visual guide square to rectangle
content = content.replace('className="relative w-64 h-64"', 'className="relative w-72 h-40"')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
