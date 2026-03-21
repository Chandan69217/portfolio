const fs = require('fs');

function applyAboutStyle(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Root Backgrounds
  content = content.replace(/bg-background/g, 'bg-slate-50 dark:bg-[#0a0a0a]');
  
  // Containers: dark:bg-white/5 bg-black/5 -> bg-white dark:bg-white/5
  content = content.replace(/dark:bg-white\/5 bg-black\/(\d+)/g, 'bg-white dark:bg-white/5');
  // Secondary inputs: dark:bg-white/5 bg-black/5 -> bg-slate-50 dark:bg-white/5
  // But wait! Our previous regex replaced ALL `bg-white/5` with `dark:bg-white/5 bg-black/5`. So inputs are also `bg-black/5`.
  // Since all containers became `bg-white`, maybe inputs also become `bg-white`. The About page inputs are `bg-slate-50 dark:bg-white/5`.
  // Wait, if we replace all `bg-black` with `bg-white`, some might get `bg-white` inside `bg-white` which is fine if they have a border. The border handles contrast.

  // Borders: border-black/10 -> border-slate-200
  content = content.replace(/dark:border-white\/(\d+) border-black\/\d+/g, 'border-slate-200 dark:border-white/$1');
  
  // Hover Backgrounds: hover:bg-black/10 -> hover:bg-slate-50
  content = content.replace(/dark:hover:bg-white\/(\d+) hover:bg-black\/\d+/g, 'hover:bg-slate-50 dark:hover:bg-white/$1');

  // Text: text-foreground -> text-slate-900 dark:text-white
  // Except for some text-foreground that we replaced. Wait, `text-foreground` is default.
  // Actually, wait, `text-foreground` on inputs is fine, or we can use `text-slate-900 dark:text-white`.
  content = content.replace(/\btext-foreground\b/g, 'text-slate-900 dark:text-white');

  // Text transparencies: text-black/X -> text-slate-500
  content = content.replace(/text-black\/(20|30|40|50|60)/g, 'text-slate-500');
  content = content.replace(/hover:text-black\/(60|80)/g, 'hover:text-slate-900');

  // Placeholder transparencies
  content = content.replace(/placeholder-black\/\d+/g, 'placeholder:text-slate-400');
  content = content.replace(/dark:placeholder-white\/\d+/g, 'dark:placeholder-white/40');

  // Fix button text inside indigo
  // In our previous script, we explicitly replaced `text-foreground` with `text-white` for Indigo/Red/Emerald buttons
  // So they are already `text-white`, which is correct. We don't need to touch them.

  // Drop shadows
  content = content.replace(/shadow-2xl/g, 'shadow-sm dark:shadow-none');

  fs.writeFileSync(filePath, content, 'utf8');
}

applyAboutStyle('src/app/admin/page.tsx');
applyAboutStyle('src/app/admin/login/page.tsx');
console.log('Successfully aligned admin colors with about page schemas!');
