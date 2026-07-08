const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
c = c.replace('<span class="badge">3</span>', '<span class="badge" id="wishlistCount" style="display:none;">0</span>');
fs.writeFileSync('public/index.html', c);

let c2 = fs.readFileSync('public/collection.html', 'utf8');
c2 = c2.replace('<span class="badge">3</span>', '<span class="badge" id="wishlistCount" style="display:none;">0</span>');
fs.writeFileSync('public/collection.html', c2);
