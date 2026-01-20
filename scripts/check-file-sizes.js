const fs = require('fs');
const path = require('path');

const CONFIG = {
  // Thresholds
  WARNING_THRESHOLD: 400,
  ERROR_THRESHOLD: 600,
  
  // Directories to scan
  INCLUDE_DIRS: ['.'],
  
  // Directories to ignore
  IGNORE_DIRS: [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    'coverage',
    '.gemini',
    'public',
    'types', // Often has large generated files or definitions
    'storybook-static',
  ],
  
  // Files to ignore (basename)
  IGNORE_FILES: [
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'next-env.d.ts',
  ],
  
  // Extensions to check
  EXTENSIONS: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'],
};

// Colors for output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

let exitCode = 0;

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    console.error(`${COLORS.red}Error reading file: ${filePath}${COLORS.reset}`);
    return 0;
  }
}

function shouldIgnore(dirName) {
  return CONFIG.IGNORE_DIRS.includes(dirName);
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!shouldIgnore(file) && !file.startsWith('.')) {
        scanDirectory(fullPath);
      }
    } else {
      const ext = path.extname(file);
      if (
        CONFIG.EXTENSIONS.includes(ext) &&
        !CONFIG.IGNORE_FILES.includes(file) &&
        !file.endsWith('.test.ts') && // Ignore tests usually
        !file.endsWith('.test.tsx')
      ) {
        const lines = countLines(fullPath);
        if (lines > CONFIG.ERROR_THRESHOLD) {
          console.error(
            `${COLORS.red}[ERROR] ${fullPath} has ${lines} lines (Limit: ${CONFIG.ERROR_THRESHOLD})${COLORS.reset}`
          );
          exitCode = 1;
        } else if (lines > CONFIG.WARNING_THRESHOLD) {
          console.warn(
            `${COLORS.yellow}[WARN]  ${fullPath} has ${lines} lines (Threshold: ${CONFIG.WARNING_THRESHOLD})${COLORS.reset}`
          );
        }
      }
    }
  }
}

console.log(`${COLORS.cyan}Starting file size check...${COLORS.reset}`);
console.log(`Warning threshold: ${CONFIG.WARNING_THRESHOLD} lines`);
console.log(`Error threshold:   ${CONFIG.ERROR_THRESHOLD} lines`);
console.log('---');

try {
  for (const dir of CONFIG.INCLUDE_DIRS) {
    scanDirectory(dir);
  }
} catch (error) {
  console.error(`${COLORS.red}Script failed:${COLORS.reset}`, error);
  process.exit(1);
}

if (exitCode === 0) {
  console.log('---');
  console.log(`${COLORS.cyan}Check passed!${COLORS.reset}`);
} else {
  console.log('---');
  console.log(`${COLORS.red}Check failed! Please refactor large files.${COLORS.reset}`);
}

process.exit(exitCode);
