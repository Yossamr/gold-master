import re

file_path = 'services/db.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace local DB login logic (in-memory users)
content = re.sub(r'const found = users\.find\(u => u\.email === email && u\.pin === pin && u\.active\);', 
                 'let found = null;\n          for (const u of users) {\n            if (u.email === email && u.active) {\n              const isValid = await AuthService.verifyPin(pin, u.pin);\n              if (isValid) {\n                found = u;\n                break;\n              }\n            }\n          }', content)

# Replace Turso DB login logic
# In Turso, we must fetch the user by email, then verify hash.
content = re.sub(r'const res = await db\.execute\(\{\n\s*sql: "SELECT \* FROM users WHERE email = \? AND pin = \? AND active = 1",\n\s*args: \[email, pin\]\n\s*\}\);', 
                 'const res = await db.execute({\n          sql: "SELECT * FROM users WHERE email = ? AND active = 1",\n          args: [email]\n        });', content)

# Check hash after fetching from Turso
content = re.sub(r'if \(res\.rows\.length === 0\) return null;', 
                 'if (res.rows.length === 0) return null;\n        \n        const u = res.rows[0];\n        const storedPin = u.pin as string;\n        const isValid = await AuthService.verifyPin(pin, storedPin);\n        if (!isValid) return null;', content)

# We need to import AuthService inside db.ts? No, it's probably better to do this inside AuthService and let db.ts fetch user by email.
# Let's check how AuthService login works.
