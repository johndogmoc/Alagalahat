const fs = require('fs');
let css = fs.readFileSync('components/lost-pets/LostPetReportForm.css', 'utf8');

const vars = `
/* Variables for Light/Dark mode sync */
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
}
`;

css = vars + "\n" + css;

// Backgrounds
css = css.replace(/#0f172a/gi, 'var(--lpr-bg)');
css = css.replace(/#1e293b/gi, 'var(--lpr-card)');

// Borders
css = css.replace(/#334155/gi, 'var(--lpr-border)');
css = css.replace(/#475569/gi, 'var(--lpr-border-hover)');

// Text
css = css.replace(/#f1f5f9/gi, 'var(--lpr-text-primary)');
css = css.replace(/#e2e8f0/gi, 'var(--lpr-text-secondary)');
css = css.replace(/#94a3b8/gi, 'var(--lpr-text-muted)');
css = css.replace(/#64748b/gi, 'var(--lpr-text-muted)');

// Hover
css = css.replace(/rgba\(255,255,255,0\.04\)/gi, 'var(--lpr-hover-bg)');

// Write back
fs.writeFileSync('components/lost-pets/LostPetReportForm.css', css);
