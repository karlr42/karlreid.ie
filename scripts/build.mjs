import { cp, mkdir, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
await cp('app', 'dist', { recursive: true, filter: path => !path.endsWith('.DS_Store') });
console.log('Built static site in dist/');
