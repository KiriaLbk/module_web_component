const fs = require('fs');

let index = fs.readFileSync('./dist/custome-component/index.html', 'UTF-8');
index = index.replace('runtime.js" defer></script><script src="polyfills.js" defer></script><script src="main.js', 'web-text-element.js');
fs.writeFileSync('./dist/custome-component/index.html', index);
