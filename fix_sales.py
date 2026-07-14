import os
import re

file_path = 'pages/Sales.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find where handleSave updates bullion
pattern = r"if \(ci.linkedBullionId\) \{\s+const countChange = ci.type === TransactionType.SALE \? -qtyVal : qtyVal;\s+const weightChange = ci.type === TransactionType.SALE \? -Number\(ci.weight\) : Number\(ci.weight\);\s+const opName = ci.type === TransactionType.SALE \? `فاتورة بيع \(\$\{invoiceId\}\)` : `فاتورة شراء \(\$\{invoiceId\}\)`;\s+BullionService.updateInventory\(ci.linkedBullionId, countChange, weightChange, opName, ci.type === TransactionType.SALE \? 'OUT' : 'IN'\);\s+\}"

replacement = """if (ci.linkedBullionId) {
        const countChange = ci.type === TransactionType.SALE ? -qtyVal : qtyVal;
        const weightChange = ci.type === TransactionType.SALE ? -Number(ci.weight) : Number(ci.weight);
        const opName = ci.type === TransactionType.SALE ? `فاتورة بيع (${invoiceId})` : `فاتورة شراء (${invoiceId})`;
        BullionService.updateInventory(ci.linkedBullionId, countChange, weightChange, opName, ci.type === TransactionType.SALE ? 'OUT' : 'IN');
      } else {
        const isBullionName = (name: string): boolean => {
          const normalized = name.trim().toLowerCase();
          return normalized.includes('سبيك') || normalized.includes('جنيه') || normalized.includes('انصة') || normalized.includes('أونصة');
        };
        if (isBullionName(ci.itemName)) {
          const countChange = ci.type === TransactionType.SALE ? -qtyVal : qtyVal;
          const weight = Number(ci.weight);
          const weightPerUnit = qtyVal > 0 ? (weight / qtyVal) : weight;
          
          BullionService.addBullionType({
              company: ci.itemName,
              bullionType: ci.itemName.includes('جنيه') ? 'جنيه' : 'سبيكة',
              weight: weightPerUnit,
              karat: ci.karat || Karat.K24,
              count: countChange,
              shop: currentShop
          });
        }
      }"""

content = re.sub(pattern, replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

