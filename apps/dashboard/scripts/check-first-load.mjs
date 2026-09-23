#!/usr/bin/env node
/**
 * The real first-load budget: serves dist/, opens "/" in headless Chromium and
 * sums (brotli) every JS file the browser actually downloads — the entry chunk,
 * the chunks it imports and the lazily loaded route chunks for "/". Counting
 * only `index-*.js` (the old check) missed ~64 kB of shared code that moves
 * between chunks as pages are added.
 *
 * Usage: pnpm build && pnpm size:first-load
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import { chromium } from '@playwright/test';

const BUDGET_KB = 200;

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('✖ dist/ not found — run `pnpm build` first.');
  process.exit(1);
}

const TYPES = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' };
const server = http
  .createServer((request, response) => {
    let file = path.join(dist, decodeURIComponent(request.url.split('?')[0]));
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(dist, 'index.html'); // SPA fallback, like the nginx image
    }
    response.setHeader('content-type', TYPES[path.extname(file)] ?? 'application/octet-stream');
    response.end(fs.readFileSync(file));
  })
  .listen(0);

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const scripts = new Set();
  page.on('request', (request) => {
    const { pathname } = new URL(request.url());
    if (pathname.endsWith('.js')) scripts.add(pathname);
  });
  await page.goto(`http://localhost:${server.address().port}/`, { waitUntil: 'networkidle' });

  let totalBytes = 0;
  for (const script of scripts) {
    const bytes = zlib.brotliCompressSync(fs.readFileSync(path.join(dist, script))).length;
    totalBytes += bytes;
    console.log(`  ${(bytes / 1024).toFixed(1).padStart(7)} kB  ${script}`);
  }
  const totalKb = totalBytes / 1024;
  console.log(`First load of "/": ${totalKb.toFixed(1)} kB brotli (budget ${BUDGET_KB} kB)`);
  if (totalKb > BUDGET_KB) {
    console.error(`✖ Over budget by ${(totalKb - BUDGET_KB).toFixed(1)} kB.`);
    process.exitCode = 1;
  }
} finally {
  await browser.close();
  server.close();
}
