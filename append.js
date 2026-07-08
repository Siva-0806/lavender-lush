const fs = require('fs');
fs.appendFileSync('public/app.js', `
// Handle collection page category
const urlParams = new URLSearchParams(window.location.search);
const catParam = urlParams.get('category');
if (catParam) {
  setTimeout(() => {
    const tab = document.querySelector(\`.tab-btn[data-filter="\${catParam}"]\`);
    if(tab) tab.click();
  }, 100);
}
`);
