import os

file_path = 'services/storage.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# CSS adjustments
css_old_top_logo = """.shop-logo-img-top {
                 max-height: 0.35cm;
                 max-width: 90%;
                 object-fit: contain;
             }"""
css_new_top_logo = """.logo-container-top {
                 width: 100%;
                 display: flex;
                 flex-direction: column;
                 justify-content: center;
                 align-items: center;
                 margin-bottom: 1px;
                 margin-top: 1px;
             }
             .shop-logo-img-top {
                 max-height: 0.55cm;
                 max-width: 90%;
                 object-fit: contain;
             }
             .tag-shop-name-top {
                  font-size: 7px;
                  font-weight: 800;
                  color: #000000;
                  text-align: center;
                  margin-top: 1px;
             }"""

if css_old_top_logo in content:
    content = content.replace(css_old_top_logo, css_new_top_logo)
elif css_old_top_logo.replace('\n', '\r\n') in content:
    content = content.replace(css_old_top_logo.replace('\n', '\r\n'), css_new_top_logo.replace('\n', '\r\n'))
else:
    # Let's just find and replace the block
    import re
    content = re.sub(r'\.shop-logo-img-top\s*\{[^}]*\}', css_new_top_logo, content)

css_old_logo_container_top = """.logo-container-top {
                 width: 100%;
                 display: flex;
                 justify-content: center;
                 align-items: center;
                 margin-bottom: 1px;
                 margin-top: 1px;
             }"""
if css_old_logo_container_top in content:
    content = content.replace(css_old_logo_container_top, "")

# Same for bottom half logo (maybe they meant both? I'll increase both slightly just in case, but let's focus on top half as it was tiny)
# "كبر اللوجو هنا" probably means the top one, or both.

html_old_top_1 = """${store.logoBase64
                               ? `<div class="logo-container-top"><img class="shop-logo-img-top" src="${store.logoBase64}" /></div>`
                               : `<div class="app-logo">${storeName}</div>`
                            }"""
html_new_top_1 = """${store.logoBase64
                               ? `<div class="logo-container-top">
                                    <img class="shop-logo-img-top" src="${store.logoBase64}" />
                                    <div class="tag-shop-name-top">${storeName}</div>
                                  </div>`
                               : `<div class="app-logo">${storeName}</div>`
                            }"""

content = content.replace(html_old_top_1, html_new_top_1)
# try line endings if fail
if html_old_top_1 not in content:
    content = content.replace(html_old_top_1.replace('\n', '\r\n'), html_new_top_1.replace('\n', '\r\n'))


# Bottom half
html_old_bottom_1 = """${store.logoBase64
                               ? `<div class="logo-container"><img class="shop-logo-img" src="${store.logoBase64}" /></div>`
                               : `<div class="tag-shop-name">${storeName}</div>`
                            }"""
html_new_bottom_1 = """${store.logoBase64
                               ? `<div class="logo-container">
                                    <img class="shop-logo-img" style="max-height: 0.6cm;" src="${store.logoBase64}" />
                                    <div class="tag-shop-name">${storeName}</div>
                                  </div>`
                               : `<div class="tag-shop-name">${storeName}</div>`
                            }"""

content = content.replace(html_old_bottom_1, html_new_bottom_1)
if html_old_bottom_1 not in content:
    content = content.replace(html_old_bottom_1.replace('\n', '\r\n'), html_new_bottom_1.replace('\n', '\r\n'))

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated print logic.")
