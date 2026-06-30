const fs = require('fs');

const filePath = 'node_modules/metro-config/src/loadConfig.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add pathToFileURL import at top if not present
if (!content.includes('pathToFileURL')) {
  content = content.replace(
    "'use strict';",
    "'use strict';\nconst { pathToFileURL } = require('url');"
  );
}

// Fix the dynamic import to use file:// URL on Windows
const oldImport = 'const configModule = await import(absolutePath);';
const newImport = `const _importPath = process.platform === 'win32' && /^[a-zA-Z]:/.test(absolutePath) ? pathToFileURL(absolutePath).href : absolutePath;\n        const configModule = await import(_importPath);`;

if (content.includes(oldImport)) {
  content = content.replace(oldImport, newImport);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: metro-config patched for Windows E: drive compatibility!');
} else {
  console.log('Pattern not found - checking if already patched:', content.includes('_importPath'));
  console.log('File content around import:', content.substring(content.indexOf('import('), content.indexOf('import(') + 200));
}
