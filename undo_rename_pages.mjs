import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function undoModifications() {
  const historyFile = path.join(__dirname, 'rename_history.json');
  
  if (!fs.existsSync(historyFile)) {
    console.error('No rename history found at', historyFile);
    return;
  }
  
  const modifications = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
  
  for (const mod of modifications) {
    const originalPage = mod.original;
    const renamedTo = mod.renamedTo;
    
    // Check if the files exist
    if (fs.existsSync(originalPage) && fs.existsSync(renamedTo)) {
      // Delete the bridge page.tsx
      fs.unlinkSync(originalPage);
      
      // Rename the component back to page.tsx
      fs.renameSync(renamedTo, originalPage);
      console.log(`Restored ${renamedTo} -> ${originalPage}`);
    } else {
      console.warn(`Could not restore: one of the files missing for ${originalPage}`);
    }
  }
  
  // Optionally remove the history file
  fs.unlinkSync(historyFile);
  console.log('\nSuccessfully restored original page.tsx files.');
}

undoModifications();
