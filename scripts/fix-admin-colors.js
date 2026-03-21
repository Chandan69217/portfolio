const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix background opacities (bg-white/X -> dark:bg-white/X bg-black/X)
  content = content.replace(/\bbg-white\/(\d+)\b/g, 'dark:bg-white/$1 bg-black/$1');

  // Fix border opacities
  content = content.replace(/\bborder-white\/(\d+)\b/g, 'dark:border-white/$1 border-black/$1');

  // Fix text opacities 
  content = content.replace(/\btext-white\/(\d+)\b/g, 'dark:text-white/$1 text-black/$1');

  // Fix hover:text opacities 
  content = content.replace(/\bhover:text-white\/(\d+)\b/g, 'dark:hover:text-white/$1 hover:text-black/$1');

  // Fix hover:bg opacities
  content = content.replace(/\bhover:bg-white\/(\d+)\b/g, 'dark:hover:bg-white/$1 hover:bg-black/$1');
  
  // Fix hover:border opacities
  content = content.replace(/\bhover:border-white\/(\d+)\b/g, 'dark:hover:border-white/$1 hover:border-black/$1');

  // Fix placeholder opacities
  content = content.replace(/\bplaceholder-white\/(\d+)\b/g, 'dark:placeholder-white/$1 placeholder-black/$1');

  // For solid text-white, replace with text-foreground
  content = content.replace(/(?<!-)\btext-white\b(?!\/)/g, 'text-foreground');
  content = content.replace(/\bhover:text-white\b(?!\/)/g, 'hover:text-foreground');

  // Fix specific buttons that NEED white text against dark backgrounds like bg-indigo-600 even in light mode
  content = content.replace(/className="([^"]+)"/g, (match, classes) => {
    // If the element has a solid dark background class, revert text-foreground back to text-white
    if (classes.includes('bg-indigo-600') || classes.includes('bg-red-500') || classes.includes('bg-red-600') || classes.includes('bg-emerald-600')) {
      return match.replace(/\btext-foreground\b/g, 'text-white');
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
}

['src/app/admin/page.tsx', 'src/app/admin/login/page.tsx'].forEach(fixFile);
console.log('Successfully fixed white theme colors!');
