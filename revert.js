const fs = require('fs');

['public/index.html', 'public/collection.html'].forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');

  // 1. Remove share logic
  const shareLogicRegex = /window\.shareProduct\s*=\s*async function\([^)]*\)\s*\{[\s\S]*?\}\s*catch\(e\)\s*\{\s*console\.error\(e\);\s*\}\s*\};\s*/;
  content = content.replace(shareLogicRegex, '');

  // 2. Remove share button from renderProducts
  const shareBtnRegex = /<button class="admin-icon-btn" style="margin-right: 5px;" onclick="shareProduct\([^)]*\)" aria-label="Share"><i data-lucide="share-2" style="width:14px;height:14px;"><\/i><\/button>\s*/;
  content = content.replace(new RegExp(shareBtnRegex, 'g'), '');

  // 3. Remove image preview display logic from openProductForm
  content = content.replace(
    /document\.getElementById\('pfImage'\)\.value = p\.image;\s*if\(p\.image\)\s*\{\s*document\.getElementById\('pfImagePreview'\)\.src = p\.image;\s*document\.getElementById\('pfImagePreview'\)\.style\.display = 'block';\s*\}\s*else\s*\{\s*document\.getElementById\('pfImagePreview'\)\.style\.display = 'none';\s*\}/g,
    "document.getElementById('pfImage').value = p.image;"
  );

  content = content.replace(
    /document\.getElementById\('pfId'\)\.value = '';\s*document\.getElementById\('pfImagePreview'\)\.style\.display = 'none';/g,
    "document.getElementById('pfId').value = '';"
  );

  // 4. Remove imageUploadLogic
  const imageUploadRegex = /document\.getElementById\('pfImageFile'\)\.addEventListener\('change',\s*async\s*\(e\)\s*=>\s*\{[\s\S]*?\}\);/;
  content = content.replace(imageUploadRegex, '');

  fs.writeFileSync(f, content);
  console.log('Reverted changes in ' + f);
});
