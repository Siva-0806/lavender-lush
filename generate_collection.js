const fs = require('fs');

// Generate collection.html
let html = fs.readFileSync('public/index.html', 'utf8');

// We want to remove hero, categories, about, custom-order, reviews, instagram.
// We keep nav, shop, footer, overlays.
html = html.replace(/<section class="hero" id="home">[\s\S]*?<\/section>/, '');
html = html.replace(/<section class="categories" id="categories">[\s\S]*?<\/section>/, '');
html = html.replace(/<section class="about" id="about">[\s\S]*?<\/section>/, '');
html = html.replace(/<section class="newsletter custom-order">[\s\S]*?<\/section>/, '');
html = html.replace(/<section class="reviews">[\s\S]*?<\/section>/, '');
html = html.replace(/<section class="instagram">[\s\S]*?<\/section>/, '');

// Save to collection.html
fs.writeFileSync('public/collection.html', html);
