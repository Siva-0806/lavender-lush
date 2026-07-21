const fs = require('fs');
const path = require('path');

function patchFile(file) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix product form submit
  content = content.replace(
    /productForm\.addEventListener\('submit', \(e\) => \{[\s\S]*?closeProductForm\(\);[\s]*\}\);/g,
    `productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('pfId').value;
  const data = {
    name: document.getElementById('pfName').value.trim(),
    category: document.getElementById('pfCategory').value,
    badge: document.getElementById('pfBadge').value,
    price: parseFloat(document.getElementById('pfPrice').value),
    oldPrice: document.getElementById('pfOldPrice').value ? parseFloat(document.getElementById('pfOldPrice').value) : null,
    image: document.getElementById('pfImage').value.trim(),
    rating: parseInt(document.getElementById('pfRating').value, 10) || 0,
    reviews: parseInt(document.getElementById('pfReviews').value, 10) || 0,
  };
  
  if(id && id.length > 5 && id.startsWith('6')){ // valid mongo id check loosely
    const res = await apiFetch('/products/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if(res && res.success) showToast('Product updated', 'check-circle');
    else showToast('Error updating product', 'alert-circle');
  } else {
    const res = await apiFetch('/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if(res && res.success) showToast('Product added', 'check-circle');
    else showToast('Error adding product', 'alert-circle');
  }
  
  if (typeof fetchProducts === 'function') await fetchProducts();
  if (typeof renderAdminDashboard === 'function') renderAdminDashboard();
  if (typeof closeProductForm === 'function') closeProductForm();
});`
  );

  // Fix delete product
  content = content.replace(
    /else if\(e\.target\.closest\('\.delete-product'\)\)\{[\s\S]*?\}\s*\}\s*\n*\s*\r*\s*\}\);/g,
    `else if(e.target.closest('.delete-product')){
    if(confirm('Delete this product? This cannot be undone.')){
      const res = await apiFetch('/products/' + id, { method: 'DELETE' });
      if(res && res.success) {
        showToast('Product deleted', 'trash-2');
        if (typeof fetchProducts === 'function') await fetchProducts();
        if (typeof renderAdminDashboard === 'function') renderAdminDashboard();
      } else {
        showToast('Error deleting product', 'alert-circle');
      }
    }
  }
});`
  );

  fs.writeFileSync(filePath, content);
  console.log('Patched ' + file);
}

['public/index.html', 'public/collection.html', 'public/app.js'].forEach(patchFile);
