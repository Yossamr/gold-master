import re

file_path = 'services/storage.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add a check before accepting new price to enforce sanity bounds
sanity_check = '''              if (val > 2500 && val < 6000) {
                // SECURITY TODO: We should rely on a backend to provide verified prices.
                // Here we ensure the price doesn't swing wildly (more than 20% jump)
                const lastPrice = GoldPriceService.getStoredPrice().base21;
                if (lastPrice > 0) {
                   const diff = Math.abs(val - lastPrice) / lastPrice;
                   if (diff > 0.20) {
                       console.error("Sanity check failed: price jumped too much. Discarding.", val);
                       throw new Error("Price jump too high");
                   }
                }
                newBase21 = val;
              }'''

content = re.sub(r'if \(val > 2500 && val < 6000\) \{\n\s*newBase21 = val;\n\s*\}', sanity_check, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
