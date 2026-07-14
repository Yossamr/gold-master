import re

file_path = 'pages/TechSetup.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import for activation
content = re.sub(r'import\s+\*\s+as\s+OTPAuth\s+from\s+"otpauth";', "import { validateActivationCode, activateLocalTrial } from '../services/activation';", content)

# Remove TOTP logic
content = re.sub(r'  // Secret Key for TOTP \(Base32\) - Hidden from UI\n  const TOTP_SECRET = "K5XW6Z3DPE5K3LMP";\n  const ISSUER = "GoldMaster";\n  const LABEL = "SystemActivation";\n\n  // Generate TOTP Object\n  const totp = new OTPAuth\.TOTP\(\{\n    issuer: ISSUER,\n    label: LABEL,\n    algorithm: "SHA1",\n    digits: 6,\n    period: 30,\n    secret: OTPAuth\.Secret\.fromBase32\(TOTP_SECRET\),\n  \}\);\n', '', content)

# Replace validation
content = re.sub(r'    // Validate TOTP\n    // window: 1 allows for \+/- 30 seconds drift\n    const delta = totp\.validate\(\{ token: activationKey, window: 1 \}\);\n\n    if \(delta === null\) \{', 
                 '    // Validate activation code using centralized logic\n    const isValid = validateActivationCode(activationKey);\n    if (!isValid) {', content)

# Replace local only logic
content = re.sub(r'onClick=\{\(\) => \{\n\s*localStorage\.setItem\(\'sys_use_local_only\', \'true\'\);\n\s*onComplete\(\);\n\s*\}\}', 
                 "onClick={() => {\n                  activateLocalTrial();\n                  onComplete();\n              }}", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
