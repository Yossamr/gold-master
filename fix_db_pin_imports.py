import re

# Add auth import to db.ts
file_path = 'services/db.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "import { hashPin, verifyPin }" not in content:
    content = "import { hashPin, verifyPin } from './auth';\n" + content

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Add auth import to storage.ts
file_path2 = 'services/storage.ts'
with open(file_path2, 'r', encoding='utf-8') as f:
    content2 = f.read()

if "import { hashPin, verifyPin }" not in content2:
    content2 = "import { hashPin, verifyPin } from './auth';\n" + content2

# Update storage.ts local user pin check
content2 = re.sub(r'const found = localUsers\.find\(u => u\.email === email && u\.pin === pin && u\.active\);\n\s*if \(found\) \{',
                  'let found = null;\n              for (const u of localUsers) {\n                if (u.email === email && u.active) {\n                  const isValid = await verifyPin(pin, u.pin);\n                  if (isValid) {\n                    found = u;\n                    break;\n                  }\n                }\n              }\n              if (found) {', content2)

with open(file_path2, 'w', encoding='utf-8') as f:
    f.write(content2)
