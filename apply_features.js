const fs = require('fs');

const shareLogic = `
window.shareProduct = async function(id, name, imgUrl) {
  if (!navigator.share) {
    showToast('Sharing not supported on this browser', 'alert-circle');
    navigator.clipboard.writeText(window.location.origin + '/?product=' + id);
    showToast('Link copied to clipboard', 'check-circle');
    return;
  }
  
  let files = [];
  if (navigator.canShare) {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const file = new File([blob], 'product.jpg', { type: blob.type || 'image/jpeg' });
      if (navigator.canShare({ files: [file] })) {
        files = [file];
      }
    } catch(e) { console.error('Failed to fetch image for sharing', e); }
  }

  try {
    const shareData = {
      title: name,
      text: 'Check out ' + name + ' on Lavender Lush!',
      url: window.location.origin + '/?product=' + id,
    };
    if (files.length > 0) shareData.files = files;
    
    await navigator.share(shareData);
  } catch(e) {
    console.error(e);
  }
};
`;

const imageUploadLogic = `
document.getElementById('pfImageFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('images', file);
  
  try {
    const token = localStorage.getItem('ll_admin_token');
    const res = await fetch('/api/products/upload', {
      method: 'POST',
      headers: token ? { 'Authorization': 'Bearer ' + token } : {},
      body: formData
    });
    const data = await res.json();
    if (data.success && data.urls && data.urls.length > 0) {
      document.getElementById('pfImage').value = data.urls[0];
      const preview = document.getElementById('pfImagePreview');
      preview.src = data.urls[0];
      preview.style.display = 'block';
      showToast('Image uploaded', 'check-circle');
    } else {
      showToast('Image upload failed', 'alert-circle');
    }
  } catch (err) {
    showToast('Error uploading image', 'alert-circle');
  }
});
`;

['public/index.html', 'public/collection.html'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  if (!content.includes("pfImageFile').addEventListener")) {
    content = content.replace(/document\.getElementById\('pfImage'\)\.value = p\.image;/g, "document.getElementById('pfImage').value = p.image;\n    if(p.image) { document.getElementById('pfImagePreview').src = p.image; document.getElementById('pfImagePreview').style.display = 'block'; } else { document.getElementById('pfImagePreview').style.display = 'none'; }");
    content = content.replace(/document\.getElementById\('pfId'\)\.value = '';/g, "document.getElementById('pfId').value = '';\n    document.getElementById('pfImagePreview').style.display = 'none';");
    content = content.replace(/(productFormOverlay\.addEventListener\('click', closeProductForm\);)/, '$1\n' + imageUploadLogic);
  }

  if (!content.includes('window.shareProduct =')) {
    content = content.replace(/(async function fetchProducts\(\) \{)/, shareLogic + '\n$1');
  }

  if (!content.includes('onclick="shareProduct(')) {
    // Avoid syntax errors with single quotes inside template strings in JS
    const replaceWith = '<button class="admin-icon-btn" style="margin-right: 5px;" onclick="shareProduct(\\'${p.id}\\', \\`${p.name}\\`, \\'${p.image}\\')" aria-label="Share"><i data-lucide="share-2" style="width:14px;height:14px;"></i></button>\n          <button class="add-cart-btn" data-id="${p.id}">';
    content = content.replace(/<button class="add-cart-btn" data-id="\$\{p\.id\}">/g, replaceWith);
  }

  fs.writeFileSync(f, content);
});
console.log('Features added');
