const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. FOOTER: Social icons
html = html.replace(/<div class="footer-social">[\s\S]*?<\/div>/, `
<div class="footer-social">
  <a href="https://instagram.com/_lavender_lush" target="_blank" aria-label="Instagram"><i data-lucide="instagram"></i></a>
  <a href="mailto:contact@lavenderlush.com" aria-label="Email"><i data-lucide="mail"></i></a>
  <a href="https://wa.me/9789512412" target="_blank" aria-label="WhatsApp"><i data-lucide="phone"></i></a>
</div>
`);

// 2. SUPPORT SECTION
html = html.replace(/<li><a href="#">Track Order<\/a><\/li>/, '');
html = html.replace(/<li><a href="#">Shipping Info<\/a><\/li>/, '');

// 3. GET IN TOUCH
html = html.replace(/<h4>Get in Touch<\/h4>\s*<ul class="footer-links">[\s\S]*?<\/ul>/, `
<h4>Get in Touch</h4>
<ul class="footer-links">
  <li>Email: contact@lavenderlush.com</li>
  <li>Phone: 9789512412</li>
</ul>
`);

// 4. JOIN THE LAVENDER LUSH CIRCLE
html = html.replace(/<section class="newsletter">[\s\S]*?<\/section>/, `
<section class="newsletter custom-order">
  <div class="container">
    <div class="nl-content">
      <i data-lucide="edit-3" style="width:40px;height:40px;margin-bottom:15px;color:var(--primary);"></i>
      <h2>Customized Order Request</h2>
      <p>Have something special in mind? Let us know what you need.</p>
      <form class="nl-form" id="customOrderForm">
        <textarea id="customOrderText" rows="4" placeholder="Describe your customized order..." required style="width: 100%; border: 1px solid #ddd; border-radius: 30px; padding: 15px 25px; outline: none; font-family: inherit; margin-bottom: 10px; resize: none;"></textarea>
        <button type="submit" class="btn btn-primary" style="border-radius: 30px;">Send Request</button>
      </form>
    </div>
  </div>
</section>
`);

// 5. INSTAGRAM SECTION
html = html.replace(/<h2>Follow Us<\/h2>/, `<h2><a href="https://instagram.com/_lavender_lush" target="_blank" style="text-decoration:none; color:inherit;">@_lavender_lush</a></h2>`);
html = html.replace(/<div class="ig-likes">[\s\S]*?<\/div>/g, '');

// 6. KIND WORDS (Slider)
// The section has <div class="reviews-grid">
// We need to change its class or inject some CSS for marquee
html = html.replace(/<div class="reviews-grid">/, `<div class="reviews-marquee">`);
html = html.replace(/<\/style>/, `
.reviews-marquee {
  display: flex;
  gap: 30px;
  overflow: hidden;
  white-space: nowrap;
  padding: 20px 0;
  width: 100%;
}
.reviews-marquee-inner {
  display: flex;
  gap: 30px;
  animation: scrollMarquee 20s linear infinite;
}
.reviews-marquee:hover .reviews-marquee-inner {
  animation-play-state: paused;
}
@keyframes scrollMarquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.review-card {
  white-space: normal; /* reset for card content */
  flex-shrink: 0;
  width: 300px;
}
</style>
`);
// Duplicate the reviews inside the marquee for seamless loop
html = html.replace(/<div class="reviews-marquee">([\s\S]*?)<\/section>/, (match, p1) => {
  // Extract all review cards
  const cards = p1.match(/<div class="review-card">[\s\S]*?<\/div>\s*<\/div>/g) || [];
  const cardsHtml = cards.join('');
  const innerHtml = `<div class="reviews-marquee-inner">${cardsHtml}${cardsHtml}</div>`;
  // Everything up to the first review-card, replace with innerHtml
  const head = p1.substring(0, p1.indexOf('<div class="review-card">'));
  return `<div class="reviews-marquee">\n${innerHtml}\n</div>\n</div>\n</section>`;
});


// 7. OUR STORY (Remove circular text)
html = html.replace(/<div class="rotating-text">[\s\S]*?<\/div>/, '');

// 8. CURATED FOR YOU
html = html.replace(/<h3>Wedding Bouquets<\/h3>/g, '<h3>Accessories</h3>');
// Add wrapping <a> tag to categories
html = html.replace(/<div class="category-card"(.*?)>([\s\S]*?)<h3>(.*?)<\/h3>([\s\S]*?)<\/div>/g, (m, p1, p2, cat, p4) => {
  let mappedCat = cat.toLowerCase().replace(' ', '-');
  if (cat === 'Accessories') mappedCat = 'accessories';
  else if (cat === 'Crochet Bouquets') mappedCat = 'bouquets';
  
  return `<a href="collection.html?category=${mappedCat}" class="category-card"${p1} style="display:block; text-decoration:none; color:inherit;">${p2}<h3>${cat}</h3>${p4}</a>`;
});


// 9. HERO SECTION
// Search for hero image
html = html.replace(/<div class="hero-image">[\s\S]*?<img src=".*?" alt="Hero Image" \/>[\s\S]*?<\/div>/, `
<div class="hero-image">
  <div class="hero-slider">
    <img src="https://picsum.photos/seed/ll-hero1/600/800" alt="Hero 1" class="slide active" />
    <img src="https://picsum.photos/seed/ll-hero2/600/800" alt="Hero 2" class="slide" />
    <img src="https://picsum.photos/seed/ll-hero3/600/800" alt="Hero 3" class="slide" />
  </div>
  <div class="hero-badge">
    <i data-lucide="award"></i>
    <span>100%<br/>Handmade</span>
  </div>
</div>
`);
html = html.replace(/<\/style>/, `
.hero-slider { position: relative; width: 100%; height: 100%; min-height: 500px; border-radius: 200px 200px 0 0; overflow: hidden; }
.hero-slider img.slide { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 1s ease-in-out; }
.hero-slider img.slide.active { opacity: 1; }
</style>
`);


// 10. NAVIGATION BAR - WISHLIST
html = html.replace(/<span class="nav-badge" id="wishlistCount">3<\/span>/, `<span class="nav-badge" id="wishlistCount" style="display:none;">0</span>`);


fs.writeFileSync('public/index.html', html);
