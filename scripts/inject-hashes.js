#!/usr/bin/env node
/**
 * Computes a content hash for each CSS asset and rewrites all HTML files
 * so the href includes ?v=<hash>. The immutable CDN cache is busted
 * automatically whenever the file actually changes.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const ASSETS = [
  'css/linear.min.css',
  'css/assistant-demo.min.css',
];

const HTML_FILES = [
  'index.html',
  'en/index.html',
  'privacy-policy.html',
  'terms-of-service.html',
  'automate-whatsapp-orders.html',
  'automatizar-pedidos-whatsapp.html',
];

function contentHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}

const hashes = {};
for (const asset of ASSETS) {
  const abs = path.join(ROOT, asset);
  if (fs.existsSync(abs)) {
    hashes[asset] = contentHash(abs);
    console.log(`  ${asset} → ?v=${hashes[asset]}`);
  }
}

for (const htmlFile of HTML_FILES) {
  const abs = path.join(ROOT, htmlFile);
  if (!fs.existsSync(abs)) continue;

  let html = fs.readFileSync(abs, 'utf8');
  let changed = false;

  for (const [asset, hash] of Object.entries(hashes)) {
    // Match both relative and parent-relative paths, with or without existing ?v=...
    const escaped = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`((?:\\.\\./)?${escaped})(?:\\?v=[^"'\\s]*)?`, 'g');
    const updated = html.replace(re, `$1?v=${hash}`);
    if (updated !== html) {
      html = updated;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(abs, html, 'utf8');
    console.log(`  updated ${htmlFile}`);
  }
}

console.log('Cache busting complete.');
