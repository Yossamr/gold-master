import re

file_path = 'services/db.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace db.execute for user creation/update to hash PIN
content = re.sub(r'async addUser\(user: AppUser\): Promise<boolean> \{\n\s*if \(\!db\) return false;\n\s*try \{\n\s*await db\.execute\(\{\n\s*sql: "INSERT INTO users \(id, name, email, pin, role, active\) VALUES \(\?, \?, \?, \?, \?, \?\)",\n\s*args: \[user\.id, user\.name, user\.email \|\| \'\', user\.pin, user\.role, user\.active \? 1 : 0\]',
                 '''async addUser(user: AppUser): Promise<boolean> {
    if (!db) return false;
    try {
      const hashedPin = await hashPin(user.pin);
      await db.execute({
        sql: "INSERT INTO users (id, name, email, pin, role, active) VALUES (?, ?, ?, ?, ?, ?)",
        args: [user.id, user.name, user.email || '', hashedPin, user.role, user.active ? 1 : 0]''', content)

# Check for any other insertions or updates of PIN
content = re.sub(r'users\.push\(user\);', 'users.push({...user, pin: await hashPin(user.pin)});', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

file_path = 'services/storage.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'const owner: AppUser = \{ id: \'OWNER_1\', name: ownerName, email, role: UserRole\.OWNER, pin: pin, active: true \};',
                 'const owner: AppUser = { id: \'OWNER_1\', name: ownerName, email, role: UserRole.OWNER, pin: await hashPin(pin), active: true };', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
