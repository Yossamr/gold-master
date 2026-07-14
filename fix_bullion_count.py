import os

file_path = 'services/bullion.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("if (item.count > 0) {", "if (item.count !== 0) {")
content = content.replace("if (initialCount > 0) {", "if (initialCount !== 0) {")
content = content.replace("operation: 'إضافة رصيد (صنف مكرر)',", "operation: countChange > 0 ? 'إضافة رصيد' : 'سحب رصيد',")
content = content.replace("operation: 'رصيد أول المدة',", "operation: initialCount > 0 ? 'رصيد أول المدة' : 'سحب رصيد',")
content = content.replace("isInOut: 'IN',", "isInOut: item.count > 0 ? 'IN' : 'OUT',")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
