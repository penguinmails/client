
const fs = require('fs');
const path = require('path');

const replacements = [
    // Longer paths first to avoid partial matches
    { from: '@/components/unified', to: '@/components/unified' },
    { from: '@/components', to: '@/components' },
    { from: '@/components/ui/skeleton', to: '@/components/ui/skeleton' },
    { from: '@/components/design-system', to: '@/components/design-system' },
    { from: '@/components/layout', to: '@/components/layout' },
    
    // Core shared moves
    { from: '@/components', to: '@/components' },
    { from: '@/hooks', to: '@/hooks' },
    { from: '@/context', to: '@/context' },
    { from: '@/types', to: '@/types' },
    
    // Lib moves
    { from: '@/lib/utils', to: '@/lib/utils' },
    { from: '@/lib/config', to: '@/lib/config' },
    { from: '@/lib/queries', to: '@/lib/queries' },
    { from: '@/lib/validation', to: '@/lib/validation' },
    { from: '@/lib/theme', to: '@/lib/theme' },
    { from: '@/lib/mocks', to: '@/lib/mocks' },
];

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            }
        } else {
            if (file.match(/\.(js|jsx|ts|tsx|md|mdx|json)$/)) { // Include markdown probably? Or just code. JSON for tsconfig maybe?
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const rootDir = process.cwd();
const files = getAllFiles(rootDir);

let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    replacements.forEach(rep => {
         // Regex to match imports (escape special chars in path)
         const escapedFrom = rep.from.replace(/\//g, '\\/');
         const regex = new RegExp(`(['"])${escapedFrom}(['"\\/])`, 'g');
         // Replace with check for trailing slash or quote
         content = content.replace(regex, (match, p1, p2) => {
             return `${p1}${rep.to}${p2}`;
         });
    });

    if (content !== originalContent) {
        fs.writeFileSync(file, content);
        console.log(`Updated: ${file}`);
        changedFiles++;
    }
});

console.log(`Migration complete. Updated ${changedFiles} files.`);
