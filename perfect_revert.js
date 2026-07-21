const fs = require('fs');

const cleanRenderProducts = `function renderProducts(){
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
}`;

['public/index.html', 'public/collection.html'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // Replace whatever broken renderProducts is there with the clean one.
  // The broken renderProducts might be missing the middle part, or it might have the share button.
  // We'll use a regex that matches from `function renderProducts(){` up to the closing brace `}` right before `renderProducts();` or `/* ====`.
  
  const renderRegex = /function renderProducts\(\)\s*\{[\s\S]*?(?=renderProducts\(\);|(?:\/\*\s*={60}))/;
  
  content = content.replace(renderRegex, cleanRenderProducts + '\n');
  
  fs.writeFileSync(f, content);
  console.log('Fixed renderProducts in ' + f);
});
