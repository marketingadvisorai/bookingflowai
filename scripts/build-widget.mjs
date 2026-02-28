import { build } from 'esbuild';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const outDir = path.resolve(process.cwd(), 'public', 'embed', 'v1');
fs.mkdirSync(outDir, { recursive: true });

const tmpOutfile = path.join(outDir, 'widget.__tmp__.js');

await build({
  entryPoints: [path.resolve(process.cwd(), 'src', 'embed', 'widget.ts')],
  outfile: tmpOutfile,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2018'],
  minify: true,
  sourcemap: true,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});

const js = fs.readFileSync(tmpOutfile);
const hash = crypto.createHash('sha256').update(js).digest('hex').slice(0, 10);
const hashedName = `widget.${hash}.js`;
const hashedPath = path.join(outDir, hashedName);

// Move bundled output + sourcemap to hashed filenames
fs.renameSync(tmpOutfile, hashedPath);
if (fs.existsSync(`${tmpOutfile}.map`)) {
  fs.renameSync(`${tmpOutfile}.map`, `${hashedPath}.map`);
}

// Write a tiny stable loader at widget.js.
// This is the URL integrators embed. It forwards all data-* attrs to the real bundle.
const loader = `/*! BookingFlow Widget loader (stable) */\n(function(){\n  try {\n    var cs = document.currentScript;\n    if (!cs) {\n      // Fallback: last script tag\n      var ss = document.getElementsByTagName('script');\n      cs = ss[ss.length-1];\n    }\n    if (!cs) return;\n\n    var src = cs.getAttribute('src') || '';\n    var base = src.split('?')[0];\n    base = base.slice(0, base.lastIndexOf('/') + 1);\n\n    var s = document.createElement('script');\n    s.src = base + ${JSON.stringify(hashedName)};\n    // Forward data-* attributes\n    for (var i = 0; i < cs.attributes.length; i++) {\n      var a = cs.attributes[i];\n      if (a && a.name && a.name.indexOf('data-') === 0) {\n        s.setAttribute(a.name, a.value);\n      }\n    }\n    document.body.appendChild(s);\n  } catch (e) {\n    // silent\n  }\n})();\n`;

fs.writeFileSync(path.join(outDir, 'widget.js'), loader);
// Clean up old maps from previous builds (loader has no sourcemap).
try { fs.rmSync(path.join(outDir, 'widget.js.map')); } catch {}

// Remove older versioned bundles so the folder doesn't grow forever.
for (const f of fs.readdirSync(outDir)) {
  if (!f.startsWith('widget.')) continue;
  if (f === 'widget.js') continue;
  if (f === hashedName || f === `${hashedName}.map`) continue;
  if (f.endsWith('.js') || f.endsWith('.js.map')) {
    try { fs.rmSync(path.join(outDir, f)); } catch {}
  }
}

console.log('Built:', hashedPath);
console.log('Loader:', path.join(outDir, 'widget.js'));
