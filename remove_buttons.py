import re

file_path = 'pages/Bullions.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The block to remove is:
# <div className="flex items-center gap-1.5">
# ...
# </div>
# which follows the </div> containing "الكمية الحالية"

pattern = re.compile(r'<div className="flex items-center gap-1\.5">\s*<button.*?<LogIn size=\{16\} />\s*</button>\s*<button.*?<LogOut size=\{16\} />\s*</button>\s*<button.*?<Trash2 size=\{16\} />\s*</button>\s*</div>', re.DOTALL)
content = pattern.sub('', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
