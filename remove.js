const fs = require('fs');
let content = fs.readFileSync('public/index.html', 'utf8');
content = content.replace('placeholder="admin"', 'placeholder=""');
content = content.replace('placeholder="admin123"', 'placeholder=""');
fs.writeFileSync('public/index.html', content);
