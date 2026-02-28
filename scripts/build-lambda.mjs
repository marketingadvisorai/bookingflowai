import { build } from 'esbuild';
import path from 'node:path';
import fs from 'node:fs';

const outDir = path.resolve(process.cwd(), 'lambda', 'dist');
fs.mkdirSync(outDir, { recursive: true });

const common = {
  bundle: true,
  platform: 'node',
  target: ['node18'],
  format: 'cjs',
  sourcemap: false,
  minify: true,
  tsconfig: path.resolve(process.cwd(), 'tsconfig.json'),
  define: { 'process.env.NODE_ENV': '"production"' },
};

const entries = [
  { name: 'availability', entry: 'lambda/handlers/availability.ts' },
  { name: 'holds', entry: 'lambda/handlers/holds.ts' },
  { name: 'confirm', entry: 'lambda/handlers/confirm.ts' },
  { name: 'catalog', entry: 'lambda/handlers/catalog.ts' },
  { name: 'calendar', entry: 'lambda/handlers/calendar.ts' },
];

for (const e of entries) {
  await build({
    ...common,
    entryPoints: [path.resolve(process.cwd(), e.entry)],
    outfile: path.join(outDir, `${e.name}.cjs`),
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  });
  console.log('Built', e.name);
}
