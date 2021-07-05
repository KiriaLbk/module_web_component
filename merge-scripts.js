const fs = require('fs');

const runtime = fs.readFileSync('./dist/custome-component/runtime.js');
const polyfills = fs.readFileSync('./dist/custome-component/polyfills.js');
const main = fs.readFileSync('./dist/custome-component/main.js');
fs.writeFileSync('./dist/custome-component/web-text-element.js', (runtime + polyfills + main))
