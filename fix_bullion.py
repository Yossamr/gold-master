import os
import re

file_path = 'services/bullion.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix currentShop logic in addBullionType
old_shop_logic = "const currentShop = localStorage.getItem('selected_shop') || 'المحل الأساسي';"
new_shop_logic = "const currentShop = item.shop || localStorage.getItem('selected_shop') || 'المحل الأساسي';"

content = content.replace(old_shop_logic, new_shop_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
