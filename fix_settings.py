import re

file_path = 'pages/Settings.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import for activation
if "import * as OTPAuth from 'otpauth';" in content:
    content = content.replace("import * as OTPAuth from 'otpauth';", "import { validateActivationCode, activateLocalTrial } from '../services/activation';")
elif "import * as OTPAuth from \"otpauth\";" in content:
    content = content.replace("import * as OTPAuth from \"otpauth\";", "import { validateActivationCode, activateLocalTrial } from '../services/activation';")
else:
    content = "import { validateActivationCode, activateLocalTrial } from '../services/activation';\n" + content

# Remove TOTP logic
content = re.sub(r'  // Secret Key for TOTP \(Base32\) - Hidden from UI\n  const TOTP_SECRET = "K5XW6Z3DPE5K3LMP";\n  const ISSUER = "GoldMaster";\n  const LABEL = "SystemActivation";\n', '', content)

# Replace validation
content = re.sub(r'    // Validate TOTP\n    try \{\n      const totp = new OTPAuth\.TOTP\(\{\n        issuer: ISSUER,\n        label: LABEL,\n        algorithm: "SHA1",\n        digits: 6,\n        period: 30,\n        secret: OTPAuth\.Secret\.fromBase32\(TOTP_SECRET\),\n      \}\);\n\n      const delta = totp\.validate\(\{ token: dbActivationKey\.trim\(\), window: 1 \}\);\n\n      if \(delta === null\) \{', 
                 '    // Validate activation code using centralized logic\n    try {\n      const isValid = validateActivationCode(dbActivationKey);\n      if (!isValid) {', content)

# Replace local only logic
content = re.sub(r'onClick=\{\(\) => \{\n\s*localStorage\.setItem\(\'sys_use_local_only\', \'true\'\);\n\s*window\.location\.reload\(\);\n\s*\}\}', 
                 "onClick={() => {\n                  activateLocalTrial();\n                  window.location.reload();\n              }}", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
