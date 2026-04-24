import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = fileURLToPath(new URL('../dist', import.meta.url));

function findHtmlFiles(dir) {
  const result = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...findHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      result.push(fullPath);
    }
  }
  return result;
}

for (const htmlPath of findHtmlFiles(distDir)) {
  const depth = relative(distDir, dirname(htmlPath)).split('/').filter(Boolean).length;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);

  let html = readFileSync(htmlPath, 'utf-8');
  html = html.replace(/(href|src)="\/(?!\/)/g, `$1="${prefix}`);
  writeFileSync(htmlPath, html);

  console.log(`relativized: ${relative(distDir, htmlPath) || 'index.html'}`);
}
