
/* ============================================================
   INIT ICONS
============================================================ */
lucide.createIcons();

/* ============================================================
   NAVBAR SCROLL STATE + BACK TO TOP
============================================================ */
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 40);
  backToTop.classList.toggle('show', y > 500);
});
backToTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

/* ============================================================
   MOBILE DRAWER
============================================================ */
const menuToggle = document.getElementById('menuToggle');
const mobileDrawer = document.getElementById('mobileDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const drawerClose = document.getElementById('drawerClose');
function openDrawer(){ mobileDrawer.classList.add('open'); drawerOverlay.classList.add('open'); }
function closeDrawer(){ mobileDrawer.classList.remove('open'); drawerOverlay.classList.remove('open'); }
menuToggle.addEventListener('click', openDrawer);
drawerClose.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);
mobileDrawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

/* ============================================================
   SCROLL REVEAL
============================================================ */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

/* ============================================================
   HERO TYPING EFFECT
============================================================ */
const typingPhrases = [
  "Luxury handmade bouquets, made to order, just for you.",
  "Crochet keepsakes that never wilt, never fade.",
  "Custom gifts designed around the people you love."
];
const typingTarget = document.getElementById('typingTarget');
let phraseIndex = 0, charIndex = 0, typingDeleting = false;
function typeLoop(){
  const current = typingPhrases[phraseIndex];
  if(!typingDeleting){
    charIndex++;
    typingTarget.textContent = current.slice(0, charIndex);
    if(charIndex === current.length){
      typingDeleting = true;
      setTimeout(typeLoop, 1800);
      return;
    }
  } else {
    charIndex--;
    typingTarget.textContent = current.slice(0, charIndex);
    if(charIndex === 0){
      typingDeleting = false;
      phraseIndex = (phraseIndex + 1) % typingPhrases.length;
    }
  }
  setTimeout(typeLoop, typingDeleting ? 28 : 42);
}
typeLoop();

/* ============================================================
   PARALLAX HERO
============================================================ */
const parallaxImg = document.getElementById('parallaxImg');
const parallaxLayer = document.getElementById('parallaxLayer');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if(y < window.innerHeight){
    parallaxImg.style.transform = `translateY(${y * 0.18}px)`;
    parallaxLayer.style.transform = `translateY(${y * 0.32}px)`;
  }
});

/* ============================================================
   ANIMATED COUNTERS
============================================================ */
const counters = document.querySelectorAll('.counter');
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const isDecimal = el.dataset.decimal;
      const duration = 1600;
      const start = performance.now();
      function step(now){
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        let value = target * eased;
        el.textContent = isDecimal ? (value/10).toFixed(1) : Math.floor(value).toLocaleString();
        if(progress < 1) requestAnimationFrame(step);
        else el.textContent = isDecimal ? (target/10).toFixed(1) : target.toLocaleString();
      }
      requestAnimationFrame(step);
      counterIO.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterIO.observe(c));

/* ============================================================
   PRODUCT FILTER TABS
============================================================ */
const tabBtns = document.querySelectorAll('.tab-btn');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('#productGrid .product-card').forEach(card => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.classList.toggle('show', match);
    });
  });
});

/* ============================================================
   PRODUCT DATA (drives storefront grid + admin panel)
============================================================ */
const DEFAULT_PRODUCTS = [
  {id:'p1', name:'Lilac Tulip Bouquet', category:'bouquets', price:38, oldPrice:46, image:'https://picsum.photos/seed/tulip-bq/500/500', badge:'Bestseller', rating:5, reviews:212},
  {id:'p2', name:'Lavender Bunny Plushie', category:'plushies', price:34, oldPrice:null, image:'https://picsum.photos/seed/bunny-plushie/500/500', badge:'Bestseller', rating:4, reviews:158},
  {id:'p3', name:'Strawberry Charm Keychain', category:'keychains', price:14, oldPrice:null, image:'https://picsum.photos/seed/strawberry-key/500/500', badge:'', rating:5, reviews:94},
  {id:'p4', name:'Luxury Lavender Gift Box', category:'giftboxes', price:58, oldPrice:null, image:'https://picsum.photos/seed/luxury-giftbox/500/500', badge:'Bestseller', rating:5, reviews:76},
  {id:'p5', name:'Sunny Sunflower Bunch', category:'bouquets', price:42, oldPrice:null, image:'https://picsum.photos/seed/sunflower-bunch/500/500', badge:'New', rating:5, reviews:41},
  {id:'p6', name:'Sage Teddy Plushie', category:'plushies', price:36, oldPrice:null, image:'https://picsum.photos/seed/teddy-plushie/500/500', badge:'', rating:4, reviews:63},
  {id:'p7', name:'Daisy Chain Keychain', category:'keychains', price:16, oldPrice:null, image:'https://picsum.photos/seed/daisy-key/500/500', badge:'New', rating:5, reviews:18},
  {id:'p8', name:'Newborn Welcome Box', category:'giftboxes', price:54, oldPrice:null, image:'https://picsum.photos/seed/newborn-box/500/500', badge:'', rating:5, reviews:29},
];
const CATEGORY_LABELS = {bouquets:'Bouquets', plushies:'Plushies', keychains:'Keychains', giftboxes:'Gift Boxes'};

function loadProducts(){
  try{
    const saved = localStorage.getItem('ll_products');
    if(saved) return JSON.parse(saved);
  }catch(e){}
  return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
}
function saveProducts(){ localStorage.setItem('ll_products', JSON.stringify(products)); }
let products = loadProducts();

function starIcons(rating){
  let out = '';
  for(let i=0;i<5;i++){
    out += `<i data-lucide="star"${i < rating ? '' : ' class="empty"'}></i>`;
  }
  return out;
}

function renderProducts(){
  const grid = document.getElementById('productGrid');
  grid.innerHTML = products.map(p => `
    <div class="product-card show" data-cat="${p.category}" data-id="${p.id}">
      <div class="product-media">
        ${p.badge ? `<span class="product-badge${p.badge==='New' ? ' new' : ''}">${p.badge}</span>` : ''}
        <button class="wishlist-btn" aria-label="Wishlist"><i data-lucide="heart" style="width:16px;height:16px;"></i></button>
        <img src="${p.image}" alt="${p.name}" />
        <div class="quick-add" data-id="${p.id}"><i data-lucide="zap" style="width:14px;height:14px;"></i> Quick Add</div>
      </div>
      <div class="product-info">
        <span class="p-cat">${CATEGORY_LABELS[p.category] || p.category}</span>
        <h4>${p.name}</h4>
        <div class="p-rating">${starIcons(p.rating)}<span>(${p.reviews})</span></div>
        <div class="p-footer">
          <span class="p-price">$${p.price}${p.oldPrice ? `<small>$${p.oldPrice}</small>` : ''}</span>
          <button class="add-cart-btn" data-id="${p.id}"><i data-lucide="plus" style="width:17px;height:17px;"></i></button>
        </div>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
  const activeFilter = document.querySelector('.tab-btn.active')?.dataset.filter || 'all';
  document.querySelectorAll('#productGrid .product-card').forEach(card => {
    card.classList.toggle('show', activeFilter === 'all' || card.dataset.cat === activeFilter);
  });
}
renderProducts();

/* ============================================================
   WISHLIST TOGGLE (event delegation so re-rendered cards stay wired)
============================================================ */
document.getElementById('productGrid').addEventListener('click', (e) => {
  const wishBtn = e.target.closest('.wishlist-btn');
  if(wishBtn){
    wishBtn.classList.toggle('active');
    const countEl = document.getElementById('wishlistCount');
    let count = parseInt(countEl.textContent) || 0;
    if(wishBtn.classList.contains('active')){
      count++;
      showToast('Added to wishlist', 'heart');
    } else {
      count = Math.max(0, count - 1);
      showToast('Removed from wishlist', 'heart');
    }
    countEl.textContent = count;
    countEl.style.display = count > 0 ? 'flex' : 'none';
    return;
  }
  const cartTrigger = e.target.closest('.add-cart-btn, .quick-add');
  if(cartTrigger){
    addToCart(cartTrigger.dataset.id);
  }
});

/* ============================================================
   CART STATE
============================================================ */
function loadCart(){
  try{
    const saved = localStorage.getItem('ll_cart');
    if(saved) return JSON.parse(saved);
  }catch(e){}
  return [];
}
function saveCart(){ localStorage.setItem('ll_cart', JSON.stringify(cart)); }
let cart = loadCart();

const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsEl = document.getElementById('cartItems');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const cartCountEl = document.getElementById('cartCount');

function cartTotalQty(){ return cart.reduce((sum, i) => sum + i.qty, 0); }
function cartSubtotal(){ return cart.reduce((sum, i) => sum + i.qty * i.price, 0); }

function renderCart(){
  cartCountEl.textContent = cartTotalQty();
  cartDrawer.classList.toggle('is-empty', cart.length === 0);
  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-item-info">
        <h5>${item.name}</h5>
        <span class="ci-cat">${CATEGORY_LABELS[item.category] || item.category}</span>
        <div class="cart-item-foot">
          <div class="qty-control">
            <button class="qty-dec" aria-label="Decrease">−</button>
            <span>${item.qty}</span>
            <button class="qty-inc" aria-label="Increase">+</button>
          </div>
          <span class="ci-price">$${(item.qty * item.price).toFixed(2)}</span>
        </div>
      </div>
      <button class="ci-remove" aria-label="Remove"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
    </div>
  `).join('');
  lucide.createIcons();
  cartSubtotalEl.textContent = `$${cartSubtotal().toFixed(2)}`;
}

function addToCart(id){
  const product = products.find(p => p.id === id);
  if(!product) return;
  const existing = cart.find(i => i.id === id);
  if(existing) existing.qty++;
  else cart.push({id: product.id, name: product.name, price: product.price, image: product.image, category: product.category, qty: 1});
  saveCart();
  renderCart();
  showToast('Added to cart', 'shopping-bag');
}

cartItemsEl.addEventListener('click', (e) => {
  const row = e.target.closest('.cart-item');
  if(!row) return;
  const id = row.dataset.id;
  const item = cart.find(i => i.id === id);
  if(e.target.closest('.qty-inc')){ item.qty++; }
  else if(e.target.closest('.qty-dec')){
    item.qty--;
    if(item.qty <= 0) cart = cart.filter(i => i.id !== id);
  } else if(e.target.closest('.ci-remove')){
    cart = cart.filter(i => i.id !== id);
  } else return;
  saveCart();
  renderCart();
});

function openCart(){ cartDrawer.classList.add('open'); cartOverlay.classList.add('open'); renderCart(); }
function closeCart(){ cartDrawer.classList.remove('open'); cartOverlay.classList.remove('open'); }
document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
renderCart();

/* ============================================================
   CHECKOUT MODAL
============================================================ */
const checkoutOverlay = document.getElementById('checkoutOverlay');
const checkoutModal = document.getElementById('checkoutModal');
function openCheckout(){
  if(cart.length === 0){ showToast('Your bag is empty', 'shopping-bag'); return; }
  document.getElementById('checkoutSummary').innerHTML = cart.map(i => `
    <div class="cs-row"><span>${i.name} × ${i.qty}</span><span>$${(i.qty*i.price).toFixed(2)}</span></div>
  `).join('') + `<div class="cs-total"><span>Total</span><span>$${cartSubtotal().toFixed(2)}</span></div>`;
  closeCart();
  checkoutOverlay.classList.add('open');
  checkoutModal.classList.add('open');
}
function closeCheckout(){ checkoutOverlay.classList.remove('open'); checkoutModal.classList.remove('open'); }
document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
document.getElementById('checkoutClose').addEventListener('click', closeCheckout);
checkoutOverlay.addEventListener('click', closeCheckout);

function loadOrders(){
  try{
    const saved = localStorage.getItem('ll_orders');
    if(saved) return JSON.parse(saved);
  }catch(e){}
  return [];
}
function saveOrders(){ localStorage.setItem('ll_orders', JSON.stringify(orders)); }
let orders = loadOrders();

document.getElementById('checkoutForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const city = document.getElementById('custCity').value.trim();
  const pincode = document.getElementById('custPincode').value.trim();
  const note = document.getElementById('custNote').value.trim();

  const order = {
    id: 'LL' + Date.now().toString().slice(-6),
    date: new Date().toISOString(),
    customer: {name, phone, address, city, pincode, note},
    items: cart.map(i => ({name:i.name, qty:i.qty, price:i.price})),
    total: cartSubtotal(),
    status: 'Pending'
  };
  orders.unshift(order);
  saveOrders();

  let msg = `Hi Lavender Lush! I'd like to place an order (${order.id}):%0A%0A`;
  cart.forEach(i => { msg += `• ${i.name} × ${i.qty} — $${(i.qty*i.price).toFixed(2)}%0A`; });
  msg += `%0ATotal: $${cartSubtotal().toFixed(2)}%0A%0ADeliver to:%0A${name}, ${phone}%0A${address}, ${city} - ${pincode}`;
  if(note) msg += `%0A%0ANote: ${note}`;

  window.open(`https://wa.me/15552147788?text=${msg}`, '_blank');

  cart = [];
  saveCart();
  renderCart();
  document.getElementById('checkoutForm').reset();
  closeCheckout();
  showToast('Order placed! Redirecting to WhatsApp', 'check-circle');
  if(document.getElementById('adminPanel').classList.contains('open')) renderAdmin();
});

/* ============================================================
   ADMIN LOGIN
============================================================ */
const ADMIN_USER = 'admin', ADMIN_PASS = 'admin123';
const adminLoginOverlay = document.getElementById('adminLoginOverlay');
const adminLoginModal = document.getElementById('adminLoginModal');
function openAdminLogin(e){ if(e) e.preventDefault(); adminLoginOverlay.classList.add('open'); adminLoginModal.classList.add('open'); }
function closeAdminLogin(){ adminLoginOverlay.classList.remove('open'); adminLoginModal.classList.remove('open'); }
document.getElementById('adminLoginLink').addEventListener('click', openAdminLogin);
document.getElementById('adminLoginClose').addEventListener('click', closeAdminLogin);
adminLoginOverlay.addEventListener('click', closeAdminLogin);

document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('adminUser').value.trim();
  const password = document.getElementById('adminPass').value.trim();
  
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if(data.success && data.user.role === 'admin') {
      localStorage.setItem('ll_admin_token', data.token);
      sessionStorage.setItem('ll_admin', '1');
      closeAdminLogin();
      document.getElementById('adminLoginForm').reset();
      enterAdmin();
    } else {
      showToast('Invalid admin credentials', 'alert-circle');
    }
  } catch(err) {
    showToast('Login failed', 'alert-circle');
  }
});

function enterAdmin(){
  document.getElementById('storefrontRoot').style.display = 'none';
  document.getElementById('adminPanel').classList.add('open');
  document.body.style.overflow = '';
  renderAdmin();
}
function exitAdmin(){
  document.getElementById('adminPanel').classList.remove('open');
  document.getElementById('storefrontRoot').style.display = '';
}
document.getElementById('viewStoreBtn').addEventListener('click', exitAdmin);
document.getElementById('adminLogoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('ll_admin');
  exitAdmin();
  showToast('Logged out', 'log-out');
});
if(sessionStorage.getItem('ll_admin') === '1') enterAdmin();

/* ============================================================
   ADMIN NAV (sidebar tabs)
============================================================ */
document.querySelectorAll('.admin-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.admin-panel-section').forEach(s => s.classList.remove('active'));
    document.getElementById(btn.dataset.panel).classList.add('active');
  });
});

/* ============================================================
   ADMIN: PRODUCTS TABLE + ADD/EDIT FORM
============================================================ */
const productFormOverlay = document.getElementById('productFormOverlay');
const productFormModal = document.getElementById('productFormModal');
const productForm = document.getElementById('productForm');

function openProductForm(id){
  productForm.reset();
  if(id){
    const p = products.find(x => x.id === id);
    document.getElementById('productFormTitle').textContent = 'Edit Product';
    document.getElementById('pfSubmitBtn').textContent = 'Save Changes';
    document.getElementById('pfId').value = p.id;
    document.getElementById('pfName').value = p.name;
    document.getElementById('pfCategory').value = p.category;
    document.getElementById('pfBadge').value = p.badge || '';
    document.getElementById('pfPrice').value = p.price;
    document.getElementById('pfOldPrice').value = p.oldPrice || '';
    document.getElementById('pfImage').value = p.image;
    document.getElementById('pfRating').value = p.rating;
    document.getElementById('pfReviews').value = p.reviews;
  } else {
    document.getElementById('productFormTitle').textContent = 'Add Product';
    document.getElementById('pfSubmitBtn').textContent = 'Save Product';
    document.getElementById('pfId').value = '';
  }
  productFormOverlay.classList.add('open');
  productFormModal.classList.add('open');
}
function closeProductForm(){ productFormOverlay.classList.remove('open'); productFormModal.classList.remove('open'); }
document.getElementById('addProductBtn').addEventListener('click', () => openProductForm(null));
document.getElementById('productFormClose').addEventListener('click', closeProductForm);
productFormOverlay.addEventListener('click', closeProductForm);

productForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('pfId').value;
  const data = {
    name: document.getElementById('pfName').value.trim(),
    category: document.getElementById('pfCategory').value,
    badge: document.getElementById('pfBadge').value,
    price: parseFloat(document.getElementById('pfPrice').value),
    oldPrice: document.getElementById('pfOldPrice').value ? parseFloat(document.getElementById('pfOldPrice').value) : null,
    image: document.getElementById('pfImage').value.trim(),
    rating: parseInt(document.getElementById('pfRating').value, 10),
    reviews: parseInt(document.getElementById('pfReviews').value, 10),
  };
  if(id){
    const idx = products.findIndex(p => p.id === id);
    products[idx] = {...products[idx], ...data};
    showToast('Product updated', 'check-circle');
  } else {
    data.id = 'p' + Date.now();
    products.push(data);
    showToast('Product added', 'check-circle');
  }
  saveProducts();
  renderProducts();
  renderAdminProducts();
  renderAdminDashboard();
  closeProductForm();
});

function renderAdminProducts(){
  const tbody = document.querySelector('#adminProductsTable tbody');
  tbody.innerHTML = products.map(p => `
    <tr data-id="${p.id}">
      <td><img src="${p.image}" alt="${p.name}" /></td>
      <td>${p.name}</td>
      <td>${CATEGORY_LABELS[p.category] || p.category}</td>
      <td>$${p.price}${p.oldPrice ? ` <span style="color:var(--text-light);text-decoration:line-through;font-size:12px;">$${p.oldPrice}</span>` : ''}</td>
      <td>${p.badge ? `<span class="badge-pill">${p.badge}</span>` : '—'}</td>
      <td>${p.rating} ★ (${p.reviews})</td>
      <td>
        <div class="admin-table-actions">
          <button class="admin-icon-btn edit-product" aria-label="Edit"><i data-lucide="pencil" style="width:15px;height:15px;"></i></button>
          <button class="admin-icon-btn danger delete-product" aria-label="Delete"><i data-lucide="trash-2" style="width:15px;height:15px;"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
  lucide.createIcons();
}
document.querySelector('#adminProductsTable tbody').addEventListener('click', (e) => {
  const row = e.target.closest('tr');
  if(!row) return;
  const id = row.dataset.id;
  if(e.target.closest('.edit-product')) openProductForm(id);
  else if(e.target.closest('.delete-product')){
    if(confirm('Delete this product? This cannot be undone.')){
      products = products.filter(p => p.id !== id);
      saveProducts();
      renderProducts();
      renderAdminProducts();
      renderAdminDashboard();
      showToast('Product deleted', 'trash-2');
    }
  }
});

/* ============================================================
   ADMIN: ORDERS TABLE
============================================================ */
function statusPillHtml(status){
  const cls = status.toLowerCase();
  return `<span class="status-pill ${cls}">${status}</span>`;
}
function renderAdminOrders(){
  const tbody = document.querySelector('#adminOrdersTable tbody');
  const emptyEl = document.getElementById('ordersEmpty');
  emptyEl.style.display = orders.length ? 'none' : 'flex';
  tbody.innerHTML = orders.map(o => `
    <tr data-id="${o.id}">
      <td>${o.id}</td>
      <td>${o.customer.name}</td>
      <td>${o.customer.phone}</td>
      <td>${o.items.reduce((s,i)=>s+i.qty,0)} items</td>
      <td>$${o.total.toFixed(2)}</td>
      <td>
        <select class="status-select order-status">
          <option ${o.status==='Pending'?'selected':''}>Pending</option>
          <option ${o.status==='Confirmed'?'selected':''}>Confirmed</option>
          <option ${o.status==='Delivered'?'selected':''}>Delivered</option>
        </select>
      </td>
      <td><button class="admin-icon-btn danger delete-order" aria-label="Delete"><i data-lucide="trash-2" style="width:15px;height:15px;"></i></button></td>
    </tr>
  `).join('');
  lucide.createIcons();
}
document.querySelector('#adminOrdersTable tbody').addEventListener('change', (e) => {
  if(!e.target.classList.contains('order-status')) return;
  const row = e.target.closest('tr');
  const order = orders.find(o => o.id === row.dataset.id);
  order.status = e.target.value;
  saveOrders();
  renderAdminDashboard();
});
document.querySelector('#adminOrdersTable tbody').addEventListener('click', (e) => {
  if(!e.target.closest('.delete-order')) return;
  const row = e.target.closest('tr');
  if(confirm('Delete this order?')){
    orders = orders.filter(o => o.id !== row.dataset.id);
    saveOrders();
    renderAdminOrders();
    renderAdminDashboard();
  }
});

/* ============================================================
   ADMIN: DASHBOARD
============================================================ */
function renderAdminDashboard(){
  document.getElementById('statProducts').textContent = products.length;
  document.getElementById('statOrders').textContent = orders.length;
  document.getElementById('statPending').textContent = orders.filter(o => o.status === 'Pending').length;
  const revenue = orders.reduce((s,o) => s + o.total, 0);
  document.getElementById('statRevenue').textContent = `$${revenue.toFixed(2)}`;

  const tbody = document.querySelector('#recentOrdersTable tbody');
  const recent = orders.slice(0, 5);
  tbody.innerHTML = recent.length ? recent.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.customer.name}</td>
      <td>${o.items.reduce((s,i)=>s+i.qty,0)} items</td>
      <td>$${o.total.toFixed(2)}</td>
      <td>${statusPillHtml(o.status)}</td>
    </tr>
  `).join('') : `<tr><td colspan="5" style="text-align:center;color:var(--text-light);padding:26px 0;">No orders yet</td></tr>`;
}

function renderAdmin(){
  renderAdminDashboard();
  renderAdminProducts();
  renderAdminOrders();
}

/* ============================================================
   ADD TO CART / QUICK ADD -> CART COUNTER + TOAST
============================================================ */

/* ============================================================
   TOAST
============================================================ */
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');
let toastTimer;
function showToast(msg){
  toastText.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ============================================================
   BUTTON RIPPLE EFFECT
============================================================ */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e){
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.classList.add('ripple');
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

/* ============================================================
   TESTIMONIAL SLIDER
============================================================ */
const track = document.getElementById('testimonialTrack');
const slides = document.querySelectorAll('.testimonial-slide');
const dotsWrap = document.getElementById('sliderDots');
let slideIndex = 0;
slides.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.classList.add('slider-dot');
  if(i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(i));
  dotsWrap.appendChild(dot);
});
const dots = document.querySelectorAll('.slider-dot');
function goToSlide(i){
  slideIndex = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${slideIndex * 100}%)`;
  dots.forEach(d => d.classList.remove('active'));
  dots[slideIndex].classList.add('active');
}
document.getElementById('prevSlide').addEventListener('click', () => goToSlide(slideIndex - 1));
document.getElementById('nextSlide').addEventListener('click', () => goToSlide(slideIndex + 1));
let autoSlide = setInterval(() => goToSlide(slideIndex + 1), 5500);
document.querySelector('.testimonial-wrap').addEventListener('mouseenter', () => clearInterval(autoSlide));
document.querySelector('.testimonial-wrap').addEventListener('mouseleave', () => {
  autoSlide = setInterval(() => goToSlide(slideIndex + 1), 5500);
});

/* ============================================================
   FAQ ACCORDION
============================================================ */
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  if(item.classList.contains('open')) answer.style.maxHeight = answer.scrollHeight + 'px';
  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(other => {
      other.classList.remove('open');
      other.querySelector('.faq-answer').style.maxHeight = null;
    });
    if(!isOpen){
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

/* ============================================================
   CUSTOM ORDER FORM
============================================================ */
const customOrderForm = document.getElementById('customOrderForm');
const customOrderSuccess = document.getElementById('customOrderSuccess');
customOrderForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = document.getElementById('customOrderText').value.trim();
  if(!message) return;
  try {
    await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    customOrderForm.style.display = 'none';
    customOrderSuccess.style.display = 'flex';
    customOrderSuccess.style.alignItems = 'center';
    customOrderSuccess.style.gap = '10px';
    customOrderSuccess.style.color = 'var(--sage)';
    customOrderSuccess.style.fontWeight = '500';
    customOrderSuccess.style.position = 'relative';
    showToast('Request sent successfully!', 'check-circle');
  } catch(err) {
    showToast('Failed to send request', 'alert-circle');
  }
});

/* ============================================================
   HERO IMAGE SLIDER
============================================================ */
(function(){
  const heroSlides = document.querySelectorAll('.hero-slider .slide');
  if(heroSlides.length > 1) {
    let current = 0;
    setInterval(() => {
      heroSlides[current].classList.remove('active');
      current = (current + 1) % heroSlides.length;
      heroSlides[current].classList.add('active');
    }, 3000);
  }
})();

/* ============================================================
   SEARCH BUTTON (visual demo)
============================================================ */
document.getElementById('searchBtn').addEventListener('click', () => {
  showToast('Search coming soon');
});

