const fs = require('fs');
let css = fs.readFileSync('components/lost-pets/LostPetReportForm.css', 'utf8');

const correctVars = `/* Variables for Light/Dark mode sync */
.lpr-wrapper {
  --lpr-bg: var(--color-background, #FAFBFC);
  --lpr-card: var(--color-card, #FFFFFF);
  --lpr-border: var(--color-border, #D2D8E0);
  --lpr-border-hover: #C5CDD4;
  --lpr-text-primary: var(--color-text, #1A1A2E);
  --lpr-text-secondary: var(--color-text-muted, #626877);
  --lpr-text-muted: var(--color-text-light, #8B95A5);
  --lpr-hover-bg: rgba(0, 0, 0, 0.04);
  --lpr-input-bg: var(--color-input-bg, #FFFFFF);
}

[data-theme="dark"] .lpr-wrapper {
  --lpr-bg: #0f172a;
  --lpr-card: #1e293b;
  --lpr-border: #334155;
  --lpr-border-hover: #475569;
  --lpr-text-primary: #f1f5f9;
  --lpr-text-secondary: #e2e8f0;
  --lpr-text-muted: #94a3b8;
  --lpr-hover-bg: rgba(255,255,255,0.04);
  --lpr-input-bg: #0f172a;
}`;

// Replace the first 25 lines with the correct vars
const lines = css.split('\n');
lines.splice(0, 25, correctVars);

fs.writeFileSync('components/lost-pets/LostPetReportForm.css', lines.join('\n'));
