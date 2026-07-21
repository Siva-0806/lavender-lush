const fs = require('fs');
const path = require('path');

function patchFile(file) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. For HTML files, replace loadProducts with fetchProducts
  if (file.endsWith('.html')) {
    content = content.replace(
      /function loadProducts\(\)\{[\s\S]*?let products = loadProducts\(\);/,
      `let products = [];
async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) {
      products = data.products.map(p => ({
        id: p._id,
        name: p.name,
        category: p.category,
        price: p.price,
        oldPrice: p.oldPrice || p.compareAtPrice,
        image: p.images && p.images[0] ? p.images[0] : (p.image || 'https://picsum.photos/500/500'),
        badge: p.badge || (p.featured ? 'Bestseller' : ''),
        rating: p.rating || 5,
        reviews: p.reviewCount || p.reviews || 0
      }));
      if (typeof renderProducts === 'function') renderProducts();
      if(document.getElementById('adminPanel') && document.getElementById('adminPanel').classList.contains('open')){
         if (typeof renderAdminProducts === 'function') renderAdminProducts();
      }
    }
  } catch(e) { console.error(e); }
}
fetchProducts();`
    );

    // Add apiFetch to HTML files if missing
    if (!content.includes('async function apiFetch')) {
      content = content.replace(
        /productForm\.addEventListener\('submit'/,
        `async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('ll_admin_token');
  if (!token) return { success: false };
  options.headers = { ...options.headers, 'Authorization': \`Bearer \${token}\` };
  try {
    const res = await fetch('/api' + endpoint, options);
    return await res.json();
  } catch(e) { return { success: false }; }
}\n\nproductForm.addEventListener('submit'`
      );
    }
  }

  // 2. Replace product form submit (in both JS and HTML)
  content = content.replace(
    /productForm\.addEventListener\('submit', \(e\) => \{[\s\S]*?closeProductForm\(\);\n\}\);/,
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

  // 3. Make delete product listener async
  content = content.replace(
    /document\.querySelector\('#adminProductsTable tbody'\)\.addEventListener\('click', \(e\) => \{/,
    `document.querySelector('#adminProductsTable tbody').addEventListener('click', async (e) => {`
  );

  // 4. Replace product delete logic
  content = content.replace(
    /else if\(e\.target\.closest\('\.delete-product'\)\)\{[\s\S]*?\}\n  \}/,
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
  }`
  );

  fs.writeFileSync(filePath, content);
  console.log('Patched ' + file);
}

['public/index.html', 'public/collection.html', 'public/app.js'].forEach(patchFile);
