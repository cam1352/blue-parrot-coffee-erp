const fs = require('fs');
const files = ['index.html', 'js/app.js', 'js/ocr.js', 'css/style.css'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let buf = fs.readFileSync(file);
    let str = buf.toString('latin1');
    str = str.split(String.fromCharCode(0x95)).join(' - ');
    str = str.split(String.fromCharCode(0x96)).join('-');
    str = str.split(String.fromCharCode(0x97)).join('-');
    str = str.split(String.fromCharCode(0x91)).join("'");
    str = str.split(String.fromCharCode(0x92)).join("'");
    str = str.split(String.fromCharCode(0x93)).join('"');
    str = str.split(String.fromCharCode(0x94)).join('"');
    fs.writeFileSync(file, str, 'utf8');
    console.log('Fixed encoding for:', file);
  }
});