import re

file_path = 'services/db.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
'''      const db = getDb();
      await db.execute({
        sql: "INSERT INTO users (id, name, email, pin, role, active) VALUES (?, ?, ?, ?, ?, ?)",
        args: [user.id, user.name, user.email || '', user.pin, user.role, user.active ? 1 : 0]
      });''',
'''      const db = getDb();
      const hashedPin = await hashPin(user.pin);
      await db.execute({
        sql: "INSERT INTO users (id, name, email, pin, role, active) VALUES (?, ?, ?, ?, ?, ?)",
        args: [user.id, user.name, user.email || '', hashedPin, user.role, user.active ? 1 : 0]
      });''')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
