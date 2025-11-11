const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Copy built SDK to node_modules
// __dirname is ui/packages/nextjs/scripts
// SDK is at ui/packages/fhevm-sdk/dist
// Target is ui/packages/nextjs/node_modules/@fhevm-sdk
const sdkSource = path.join(__dirname, '../../fhevm-sdk/dist');
const sdkDest = path.join(__dirname, '../node_modules/@fhevm-sdk');

console.log('🔍 Setup SDK Script');
console.log('Current directory:', __dirname);
console.log('SDK Source:', sdkSource);
console.log('SDK Dest:', sdkDest);
console.log('SDK Source exists:', fs.existsSync(sdkSource));
console.log('SDK Dest parent exists:', fs.existsSync(path.dirname(sdkDest)));

// Check if SDK source exists, if not try alternative paths
let actualSdkSource = sdkSource;
if (!fs.existsSync(sdkSource)) {
  const workspaceRoot = path.join(__dirname, '../..');
  console.warn('⚠️ SDK dist directory missing, attempting to build @fhevm-sdk...');
  try {
    execSync('pnpm --filter @fhevm-sdk build', {
      cwd: workspaceRoot,
      stdio: 'inherit',
    });
  } catch (buildError) {
    console.error('❌ Failed to build @fhevm-sdk automatically.');
    console.error(buildError);
  }
}

if (!fs.existsSync(sdkSource)) {
  // Try multiple alternative paths
  const alternatives = [
    path.resolve(process.cwd(), '../fhevm-sdk/dist'), // From nextjs directory
    path.resolve(process.cwd(), '../../fhevm-sdk/dist'), // From scripts directory
    path.resolve(__dirname, '../../../fhevm-sdk/dist'), // Absolute from scripts
  ];
  
  let found = false;
  for (const altPath of alternatives) {
    if (fs.existsSync(altPath)) {
      actualSdkSource = altPath;
      console.log('⚠️ Using alternative SDK source:', actualSdkSource);
      found = true;
      break;
    }
  }
  
  if (!found) {
    console.error('❌ SDK dist directory not found at:', sdkSource);
    console.error('❌ Tried alternatives:', alternatives);
    console.error('Current working directory:', process.cwd());
    console.error('__dirname:', __dirname);
    // List parent directories to help debug
    try {
      const parentDir = path.dirname(__dirname);
      console.error('Parent directory contents:', fs.readdirSync(parentDir));
    } catch (e) {
      console.error('Could not read parent directory:', e.message);
    }
    process.exit(1);
  }
}

// Create @fhevm-sdk directory
const nodeModulesDir = path.join(__dirname, '../node_modules');
if (!fs.existsSync(nodeModulesDir)) {
  console.log('Creating node_modules directory...');
  fs.mkdirSync(nodeModulesDir, { recursive: true });
}

// Copy dist directory
function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('📦 Copying SDK from', actualSdkSource, 'to', sdkDest);
copyRecursiveSync(actualSdkSource, sdkDest);

// Copy package.json for proper module resolution
// actualSdkSource is the dist directory, so package.json is one level up
const sdkPackageJsonPaths = [
  path.join(__dirname, '../../fhevm-sdk/package.json'),
  path.join(path.dirname(actualSdkSource), 'package.json'),
  path.resolve(process.cwd(), '../fhevm-sdk/package.json'),
];

let sdkPackageJson = null;
for (const pkgPath of sdkPackageJsonPaths) {
  if (fs.existsSync(pkgPath)) {
    sdkPackageJson = pkgPath;
    break;
  }
}

const destPackageJson = path.join(sdkDest, 'package.json');
if (sdkPackageJson) {
  fs.copyFileSync(sdkPackageJson, destPackageJson);
  console.log('✅ SDK package.json copied from:', sdkPackageJson);
} else {
  console.warn('⚠️ SDK package.json not found. Tried:', sdkPackageJsonPaths);
  // Create a minimal package.json to allow module resolution
  const minimalPackageJson = {
    name: '@fhevm-sdk',
    version: '0.1.0',
    main: './index.js',
    types: './index.d.ts',
  };
  fs.writeFileSync(destPackageJson, JSON.stringify(minimalPackageJson, null, 2));
  console.log('⚠️ Created minimal package.json');
}

console.log('✅ SDK copied to node_modules/@fhevm-sdk');

// Verify the copy was successful
if (fs.existsSync(sdkDest)) {
  console.log('✅ Verification: @fhevm-sdk directory exists');
  const files = fs.readdirSync(sdkDest);
  console.log('✅ SDK files:', files.slice(0, 10).join(', '), files.length > 10 ? '...' : '');
  
  // Check for index.js
  const indexJsPath = path.join(sdkDest, 'index.js');
  if (fs.existsSync(indexJsPath)) {
    console.log('✅ SDK index.js exists');
  } else {
    console.error('❌ SDK index.js not found at:', indexJsPath);
    process.exit(1);
  }
} else {
  console.error('❌ Verification failed: @fhevm-sdk directory not found');
  process.exit(1);
}

