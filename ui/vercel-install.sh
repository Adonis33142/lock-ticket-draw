#!/bin/bash
set -e

echo "=== Step 1: Installing root dependencies ==="
npm install

echo "=== Step 2: Installing and building @fhevm-sdk ==="
cd packages/fhevm-sdk
npm install
npm run build
cd ../..

echo "=== Step 3: Installing nextjs dependencies ==="
cd packages/nextjs
# Use npm install with file protocol
npm install --legacy-peer-deps --no-package-lock
cd ../..

echo "=== Installation complete ==="

