const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// Update loadOrders to fetch orders
code = code.replace(/function loadOrders\(\)\{[\s\S]*?\}[\s\S]*?let orders = loadOrders\(\);/m, `
let orders = [];
async function fetchAdminOrders() {
  const data = await apiFetch('/orders');
  if(data && data.success) {
    orders = data.orders.map(o => ({
      id: o._id,
      customer: { name: o.customerInfo.name, phone: o.customerInfo.phone, address: o.customerInfo.address },
      total: o.totalAmount,
      status: o.status
    }));
  }
}
`);
code = code.replace(/function saveOrders\(\)\{[\s\S]*?\}/m, '');

// Update renderAdmin() to fetch before render
code = code.replace(/function renderAdmin\(\)\{/m, `
async function renderAdmin(){
  await fetchProducts();
  await fetchAdminOrders();
  await fetchAdminCustomers();
  await fetchAdminMessages();
`);

// Implement fetchAdminCustomers and messages
code = `
let adminCustomers = [];
async function fetchAdminCustomers() {
  const data = await apiFetch('/admin/customers');
  if(data && data.success) adminCustomers = data.customers || [];
}
let adminMessages = [];
async function fetchAdminMessages() {
  const data = await apiFetch('/messages');
  if(data && data.success) adminMessages = data.messages || [];
}
` + code;

// Update renderAdminCustomers
code = code.replace(/const tbody = document\.querySelector\('#adminCustomersTable tbody'\);[\s\S]*?tbody\.innerHTML = \[.*?\]\.map.*?join\(''\);/m, `
  const tbody = document.querySelector('#adminCustomersTable tbody');
  tbody.innerHTML = adminCustomers.map(c => \`
    <tr>
      <td>\${c.name}</td>
      <td>\${c.email}</td>
      <td>\${new Date(c.createdAt).toLocaleDateString()}</td>
      <td><span class="badge-pill">Active</span></td>
    </tr>
  \`).join('');
`);

// Update renderAdminMessages
code = code.replace(/const tbody = document\.querySelector\('#adminMessagesTable tbody'\);[\s\S]*?tbody\.innerHTML = \[.*?\]\.map.*?join\(''\);/m, `
  const tbody = document.querySelector('#adminMessagesTable tbody');
  tbody.innerHTML = adminMessages.map(m => \`
    <tr>
      <td>\${new Date(m.createdAt).toLocaleDateString()}</td>
      <td>\${m.name}</td>
      <td>\${m.email}</td>
      <td>\${m.message.substring(0, 50)}...</td>
      <td><span class="badge-pill">New</span></td>
    </tr>
  \`).join('');
`);

// Product form submit (Add/Edit)
code = code.replace(/productForm\.addEventListener\('submit', \(e\) => \{[\s\S]*?renderAdminDashboard\(\);[\s\S]*?showToast\('Product saved', 'check-circle'\);[\s\S]*?\}\);/m, `
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('pfId').value;
  const data = {
    name: document.getElementById('pfName').value.trim(),
    category: document.getElementById('pfCategory').value,
    isFeatured: document.getElementById('pfBadge').value === 'Bestseller',
    price: parseFloat(document.getElementById('pfPrice').value),
    compareAtPrice: document.getElementById('pfOldPrice').value ? parseFloat(document.getElementById('pfOldPrice').value) : null,
    images: [document.getElementById('pfImage').value.trim()],
    rating: parseInt(document.getElementById('pfRating').value, 10),
    reviews: parseInt(document.getElementById('pfReviews').value, 10),
    stock: 100,
    description: 'Beautiful ' + document.getElementById('pfName').value
  };
  
  if(id) {
    await apiFetch('/products/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } else {
    await apiFetch('/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
  
  await fetchProducts();
  showToast('Product saved', 'check-circle');
  closeProductForm();
});
`);

fs.writeFileSync('public/app.js', code);
