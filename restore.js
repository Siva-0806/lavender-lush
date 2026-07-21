const fs = require('fs');

let content = fs.readFileSync('public/index.html', 'utf8');

const toInsert = `fetchProducts();

function starIcons(rating){
  let out = '';
  for(let i=0;i<5;i++){
    out += \`<i data-lucide="star"\${i < rating ? '' : ' class="empty"'}></i>\`;
  }
  return out;
}

function renderProducts(){
  const grid = document.getElementById('productGrid');
  grid.innerHTML = products.map(p => \`
    <div class="product-card show" data-cat="\${p.category}" data-id="\${p.id}">
      <div class="product-media">
        \${p.badge ? \`<span class="product-badge\${p.badge==='New' ? ' new' : ''}">\${p.badge}</span>\` : ''}
        <img src="\${p.image}" alt="\${p.name}" />
        <div class="quick-add" data-id="\${p.id}"><i data-lucide="zap" style="width:14px;height:14px;"></i> Quick Add</div>
      </div>
      <div class="product-info">
        <span class="p-cat">\${CATEGORY_LABELS[p.category] || p.category}</span>
        <h4>\${p.name}</h4>
        <div class="p-rating">\${starIcons(p.rating)}<span>(\${p.reviews})</span></div>
        <div class="p-footer">
          <span class="p-price">Rs. \${p.price}\${p.oldPrice ? \`<small>Rs. \${p.oldPrice}</small>\` : ''}</span>
          <button class="admin-icon-btn" style="margin-right: 5px;" onclick="shareProduct('\${p.id}', \\\`\${p.name.replace(/'/g, "\\\\'")}\\\`, '\${p.image}')" aria-label="Share"><i data-lucide="share-2" style="width:14px;height:14px;"></i></button>
          <button class="add-cart-btn" data-id="\${p.id}"><i data-lucide="plus" style="width:17px;height:17px;"></i></button>
        </div>
      </div>
    </div>
  \`).join('');
  lucide.createIcons();
  const activeFilter = document.querySelector('.tab-btn.active')?.dataset.filter || 'all';
  document.querySelectorAll('#productGrid .product-card').forEach(card => {
    card.classList.toggle('show', activeFilter === 'all' || card.dataset.cat === activeFilter);
  });
}
renderProducts();

/* ============================================================`;

content = content.replace(/\/\*\s*={60}\s*WISHLIST TOGGLE/, toInsert + '\n   WISHLIST TOGGLE');
fs.writeFileSync('public/index.html', content);
console.log('Restored correctly');
