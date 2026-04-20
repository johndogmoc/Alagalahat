import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appDir = path.join(__dirname, 'app');

function sanitizeName(name) {
  // Handle dynamic routes like [id] -> id, [...slug] -> slug
  return name.replace(/\[|\]|\.\.\./g, '');
}

function getComponentName(dirName) {
  if (dirName === 'app') return 'HomePage';
  const sanitized = sanitizeName(dirName);
  return sanitized.charAt(0).toUpperCase() + sanitized.slice(1) + 'Page';
}

function findPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findPageFiles(filePath, fileList);
    } else if (file === 'page.tsx') {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

function processFiles() {
  const pageFiles = findPageFiles(appDir);
  const modifications = [];
  
  for (const filePath of pageFiles) {
    const dirPath = path.dirname(filePath);
    const dirName = path.basename(dirPath);
    
    // Skip if it's already a bridge page (check contents)
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('export { default } from')) {
      continue;
    }
    
    let newFileName = sanitizeName(dirName);
    if (dirName === 'app') {
      newFileName = 'root';
    }
    
    const newFilePath = path.join(dirPath, `${newFileName}.tsx`);
    
    // Rename original page.tsx to newFileName.tsx
    fs.renameSync(filePath, newFilePath);
    
    // Create new page.tsx that re-exports
    const exportStatement = `export { default } from './${newFileName}';\nexport * from './${newFileName}';\n`;
    fs.writeFileSync(filePath, exportStatement);
    
    modifications.push({
      original: filePath,
      renamedTo: newFilePath
    });
    
    console.log(`Renamed ${filePath} -> ${newFilePath} and created bridge page.tsx`);
  }
  
  // Save modifications to a file so we can undo later
  fs.writeFileSync(path.join(__dirname, 'rename_history.json'), JSON.stringify(modifications, null, 2));
  console.log(`\nSuccessfully processed ${modifications.length} files. History saved to rename_history.json`);
}

processFiles();
