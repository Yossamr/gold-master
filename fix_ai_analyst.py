import re

file_path = 'components/AIPriceAnalyst.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace fake sources with clearer explanation
content = re.sub(r"const analysisSteps = \[.*\];", "const analysisSteps = [\n    'يتم جلب البيانات الحية من المصادر المتاحة...',\n    'مقارنة الأسعار مع آخر تحديث...',\n    'تطبيق عوامل التصحيح (Sanity Bounds)...',\n    'تحليل الاتجاه...',\n    'إصدار التقرير النهائي...'\n  ];", content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
