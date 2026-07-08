const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

// 1. Replace DEFAULT_PRODUCTS and loadProducts
code = code.replace(/const DEFAULT_PRODUCTS = \[[\s\S]*?\];/m, '');
code = code.replace(/function loadProducts\(\)\{[\s\S]*?\}[\s\S]*?let products = loadProducts\(\);/m, `
let products = [];
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
        oldPrice: p.compareAtPrice,
        image: p.images && p.images[0] ? p.images[0] : 'https://picsum.photos/500/500',
        badge: p.isFeatured ? 'Bestseller' : '',
        rating: p.rating || 5,
        reviews: p.reviews || 0
      }));
      renderProducts();
      if(document.getElementById('adminPanel').classList.contains('open')) renderAdmin();
    }
  } catch(e) {}
}
fetchProducts();
`);

// 2. Remove saveProducts
code = code.replace(/function saveProducts\(\)\{.*?\}/m, 'function saveProducts(){}');

// 3. Replace ADMIN_USER and adminLoginForm submit
code = code.replace(/const ADMIN_USER[\s\S]*?openAdminLogin/m, `
function openAdminLogin(e){ if(e) e.preventDefault(); document.getElementById('adminLoginOverlay').classList.add('open'); document.getElementById('adminLoginModal').classList.add('open'); }
`);
code = code.replace(/document\.getElementById\('adminLoginForm'\)\.addEventListener\('submit', \(e\) => \{[\s\S]*?\}\);/m, `
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user, password: pass })
    });
    const data = await res.json();
    if(data.success && data.user.role === 'admin'){
      localStorage.setItem('ll_admin_token', data.token);
      closeAdminLogin();
      document.getElementById('adminLoginForm').reset();
      enterAdmin();
    } else {
      showToast('Invalid username or password', 'alert-circle');
    }
  } catch(err) {
    showToast('Login failed', 'alert-circle');
  }
});
`);

// 4. Replace sessionStorage with localStorage for admin
code = code.replace(/sessionStorage\.getItem\('ll_admin'\) === '1'/g, "localStorage.getItem('ll_admin_token')");
code = code.replace(/sessionStorage\.removeItem\('ll_admin'\);/g, "localStorage.removeItem('ll_admin_token');");

// 5. Replace Checkout to send to backend API
code = code.replace(/orders\.unshift\(order\);[\s\S]*?saveOrders\(\);/m, `
  try {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerInfo: { name, phone, address, city, zip: pincode },
        orderItems: cart.map(i => ({ product: null, name: i.name, quantity: i.qty, price: i.price, image: i.image })),
        totalAmount: cartSubtotal(),
        paymentMethod: 'whatsapp'
      })
    });
  } catch(err) {}
`);

// 6. Admin Panel API calls helper function
code = `
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('ll_admin_token');
  if (!token) return { success: false };
  options.headers = { ...options.headers, 'Authorization': \`Bearer \${token}\` };
  try {
    const res = await fetch('/api' + endpoint, options);
    return await res.json();
  } catch(e) { return { success: false }; }
}
` + code;

fs.writeFileSync('public/app.js', code);
