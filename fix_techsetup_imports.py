import re

file_path = 'pages/TechSetup.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import * as OTPAuth from 'otpauth';", "import { validateActivationCode, activateLocalTrial } from '../services/activation';")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
