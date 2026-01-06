/**
 * Post-install script for PolyRPC CLI
 *
 * Downloads the correct binary for the current platform from GitHub releases.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const VERSION = '0.1.0';
const REPO = 'yourusername/polyrpc';

// Platform mapping
function getPlatformInfo() {
  const platform = os.platform();
  const arch = os.arch();

  const platformMap = {
    'win32-x64': { target: 'x86_64-pc-windows-msvc', ext: '.exe' },
    'win32-arm64': { target: 'aarch64-pc-windows-msvc', ext: '.exe' },
    'darwin-x64': { target: 'x86_64-apple-darwin', ext: '' },
    'darwin-arm64': { target: 'aarch64-apple-darwin', ext: '' },
    'linux-x64': { target: 'x86_64-unknown-linux-gnu', ext: '' },
    'linux-arm64': { target: 'aarch64-unknown-linux-gnu', ext: '' },
  };

  const key = `${platform}-${arch}`;
  return platformMap[key];
}

async function downloadBinary() {
  const platformInfo = getPlatformInfo();

  if (!platformInfo) {
    console.log('⚠️  Pre-built binary not available for your platform.');
    console.log('   Please install via cargo: cargo install polyrpc-sentinel');
    return;
  }

  const binaryName = `polyrpc-${platformInfo.target}${platformInfo.ext}`;
  const url = `https://github.com/${REPO}/releases/download/v${VERSION}/${binaryName}`;
  const nativeDir = path.join(__dirname, '..', 'native');
  const destPath = path.join(nativeDir, binaryName);

  // Create native directory
  if (!fs.existsSync(nativeDir)) {
    fs.mkdirSync(nativeDir, { recursive: true });
  }

  // Skip if already downloaded
  if (fs.existsSync(destPath)) {
    console.log('✓ PolyRPC binary already installed');
    return;
  }

  console.log(`⬇️  Downloading PolyRPC binary for ${platformInfo.target}...`);

  try {
    // For now, just create a placeholder message
    // In production, this would actually download the binary
    console.log('');
    console.log('📦 Binary download not yet available (pre-release).');
    console.log('');
    console.log('To use PolyRPC now:');
    console.log('  1. Clone the repo: git clone https://github.com/' + REPO);
    console.log('  2. Build the binary: cd polyrpc/crates/sentinel && cargo build --release');
    console.log('  3. Add to PATH or copy to this package\'s native/ directory');
    console.log('');
  } catch (err) {
    console.error('Failed to download binary:', err.message);
    console.log('Please install manually via cargo: cargo install polyrpc-sentinel');
  }
}

downloadBinary().catch(console.error);
