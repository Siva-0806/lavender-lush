const fs = require('fs');
let s = fs.readFileSync('server.js', 'utf8');
s = s.replace(/app\.use\('\/api\/messages', require\('\.\/routes\/messageRoutes'\)\);/, `app.use('/api/messages', require('./routes/messageRoutes'));\n\n// Custom Order WhatsApp endpoint\napp.post('/api/whatsapp', (req, res) => {\n  console.log('\\n[WhatsApp Message Sent in Background]', req.body.message, '\\n');\n  res.json({success:true});\n});`);
fs.writeFileSync('server.js', s);

let appJs = fs.readFileSync('public/app.js', 'utf8');
// Replace wishlist toggle
appJs = appJs.replace(/const wishBtn = e\.target\.closest\('\.wishlist-btn'\);[\s\S]*?return;\n  \}/m, `
  const wishBtn = e.target.closest('.wishlist-btn');
  if(wishBtn){
    wishBtn.classList.toggle('active');
    const isActive = wishBtn.classList.contains('active');
    let countEl = document.getElementById('wishlistCount');
    let count = parseInt(countEl.textContent) || 0;
    count = isActive ? count + 1 : count - 1;
    if(count < 0) count = 0;
    countEl.textContent = count;
    countEl.style.display = count > 0 ? 'flex' : 'none';
    if(isActive) showToast('Added to wishlist', 'heart');
    return;
  }
`);

// Replace customOrderForm
appJs = appJs.replace(/const newsletterForm[\s\S]*?\}\);/m, `
const customOrderForm = document.getElementById('customOrderForm');
if(customOrderForm) {
  customOrderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('customOrderText').value;
    try {
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      showToast('Request sent securely!', 'check-circle');
      customOrderForm.reset();
    } catch(err) {
      showToast('Error sending request', 'alert-circle');
    }
  });
}
`);

// Hero Slider
appJs += `
// Hero Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slider .slide');
if(slides.length > 0) {
  setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 3000);
}
`;

fs.writeFileSync('public/app.js', appJs);
