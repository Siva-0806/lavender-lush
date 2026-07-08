const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// Delete product
code = code.replace(/if\(confirm\('Delete product\?'\)\)\{[\s\S]*?renderAdminDashboard\(\);[\s\S]*?\}/m, `
  if(confirm('Delete product?')){
    await apiFetch('/products/' + row.dataset.id, { method: 'DELETE' });
    await fetchProducts();
    showToast('Product deleted', 'trash-2');
  }
`);

// Delete order
code = code.replace(/if\(confirm\('Delete this order\?'\)\)\{[\s\S]*?renderAdminDashboard\(\);[\s\S]*?\}/m, `
  if(confirm('Delete this order?')){
    await apiFetch('/orders/' + row.dataset.id, { method: 'DELETE' });
    await fetchAdminOrders();
    renderAdminOrders();
    renderAdminDashboard();
    showToast('Order deleted', 'trash-2');
  }
`);

// Order status change
code = code.replace(/const order = orders\.find.*?order\.status = e\.target\.value;[\s\S]*?renderAdminDashboard\(\);/m, `
  const orderId = row.dataset.id;
  await apiFetch('/orders/' + orderId + '/status', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: e.target.value })
  });
  await fetchAdminOrders();
  renderAdminDashboard();
`);

fs.writeFileSync('public/app.js', code);
