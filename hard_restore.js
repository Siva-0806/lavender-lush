const fs = require('fs');

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
  if (!grid) return;
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
          <button class="add-cart-btn" data-id="\${p.id}"><i data-lucide="plus" style="width:17px;height:17px;"></i></button>
        </div>
      </div>
    </div>
  \`).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
  const activeFilter = document.querySelector('.tab-btn.active')?.dataset.filter || 'all';
  document.querySelectorAll('#productGrid .product-card').forEach(card => {
    card.classList.toggle('show', activeFilter === 'all' || card.dataset.cat === activeFilter);
  });
}
renderProducts();

/* ============================================================
`;

['public/index.html', 'public/collection.html'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('function renderProducts')) {
    content = content.replace(/WISHLIST TOGGLE/, toInsert + '   WISHLIST TOGGLE');
    fs.writeFileSync(f, content);
    console.log('Restored ' + f);
  } else {
    console.log(f + ' already has renderProducts');
  }
});
