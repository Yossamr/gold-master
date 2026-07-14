import re

file_path = 'App.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix MobileHeader
content = content.replace(
    'className="bg-[#0f172a] px-4 pt-safe-top pb-3 flex justify-between items-center border-b border-white/5 safe-pt"',
    'className="bg-[#0f172a] px-4 pt-safe-top pb-3 flex justify-between items-center border-b border-white/5 safe-pt max-w-7xl mx-auto w-full"'
)

# Fix main content wrapper
content = content.replace(
    '<div key={location.pathname} className="page-enter h-full">',
    '<div key={location.pathname} className="page-enter h-full max-w-7xl mx-auto w-full">'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
