#!/usr/bin/env tsx

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { execSync } from 'child_process';

interface BundleAnalysis {
  totalSize: number;
  chunkSizes: Record<string, number>;
  duplicatedModules: string[];
  unusedExports: string[];
  circularDependencies: string[];
  treeShakingEffectiveness: number;
}

interface ImportAnalysis {
  file: string;
  imports: string[];
  exports: string[];
  size: number;
}

class BundleAnalyzer {
  private projectRoot: string;
  private buildDir: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.buildDir = join(this.projectRoot, '.next');
  }

  async analyzeBundleSize(): Promise<BundleAnalysis> {
    console.log('🔍 Analyzing bundle size and structure...\n');

    const analysis: BundleAnalysis = {
      totalSize: 0,
      chunkSizes: {},
      duplicatedModules: [],
      unusedExports: [],
      circularDependencies: [],
      treeShakingEffectiveness: 0
    };

    // Analyze .next build output
    if (existsSync(this.buildDir)) {
      await this.analyzeNextBuild(analysis);
    }

    // Analyze component imports and exports
    await this.analyzeComponentStructure(analysis);

    // Check for circular dependencies
    await this.checkCircularDependencies(analysis);

    return analysis;
  }

  private async analyzeNextBuild(analysis: BundleAnalysis): Promise<void> {
    const staticDir = join(this.buildDir, 'static');
    if (!existsSync(staticDir)) return;

    const chunks = this.findJSChunks(staticDir);
    
    for (const chunk of chunks) {
      const size = statSync(chunk).size;
      const relativePath = relative(this.buildDir, chunk);
      analysis.chunkSizes[relativePath] = size;
      analysis.totalSize += size;
    }

    console.log('📦 Bundle Chunks Analysis:');
    const sortedChunks = Object.entries(analysis.chunkSizes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10 largest chunks

    for (const [chunk, size] of sortedChunks) {
      console.log(`  ${chunk}: ${this.formatBytes(size)}`);
    }
    console.log(`\n📊 Total Bundle Size: ${this.formatBytes(analysis.totalSize)}\n`);
  }

  private findJSChunks(dir: string): string[] {
    const chunks: string[] = [];
    
    const traverse = (currentDir: string) => {
      const items = readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = join(currentDir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (item.endsWith('.js') && !item.includes('.map')) {
          chunks.push(fullPath);
        }
      }
    };

    traverse(dir);
    return chunks;
  }

  private async analyzeComponentStructure(analysis: BundleAnalysis): Promise<void> {
    console.log('🧩 Analyzing component structure and imports...\n');

    const componentDirs = [
      'components',
      'features',
      'shared',
      'app'
    ];

    const importMap = new Map<string, ImportAnalysis>();

    for (const dir of componentDirs) {
      if (existsSync(dir)) {
        await this.analyzeDirectory(dir, importMap);
      }
    }

    // Check for potential duplication
    this.checkForDuplication(importMap, analysis);
    
    // Analyze tree-shaking effectiveness
    this.analyzeTreeShaking(importMap, analysis);
  }

  private async analyzeDirectory(dir: string, importMap: Map<string, ImportAnalysis>): Promise<void> {
    const traverse = (currentDir: string) => {
      const items = readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = join(currentDir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          this.analyzeFile(fullPath, importMap);
        }
      }
    };

    traverse(dir);
  }

  private analyzeFile(filePath: string, importMap: Map<string, ImportAnalysis>): void {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const size = statSync(filePath).size;
      
      const imports = this.extractImports(content);
      const exports = this.extractExports(content);
      
      importMap.set(filePath, {
        file: filePath,
        imports,
        exports,
        size
      });
    } catch (error) {
      // Skip files that can't be read
    }
  }

  private extractImports(content: string): string[] {
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;
    const imports: string[] = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  private extractExports(content: string): string[] {
    const exportRegex = /export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type)\s+(\w+)/g;
    const namedExportRegex = /export\s+\{([^}]+)\}/g;
    const exports: string[] = [];
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    while ((match = namedExportRegex.exec(content)) !== null) {
      const namedExports = match[1].split(',').map(e => e.trim().split(' as ')[0]);
      exports.push(...namedExports);
    }
    
    return exports;
  }

  private checkForDuplication(importMap: Map<string, ImportAnalysis>, analysis: BundleAnalysis): void {
    const exportCounts = new Map<string, string[]>();
    
    for (const [file, data] of importMap) {
      for (const exportName of data.exports) {
        if (!exportCounts.has(exportName)) {
          exportCounts.set(exportName, []);
        }
        exportCounts.get(exportName)!.push(file);
      }
    }

    for (const [exportName, files] of exportCounts) {
      if (files.length > 1 && !exportName.startsWith('use') && exportName !== 'default') {
        analysis.duplicatedModules.push(`${exportName} (${files.length} files: ${files.join(', ')})`);
      }
    }

    if (analysis.duplicatedModules.length > 0) {
      console.log('⚠️  Potential Duplicated Exports:');
      analysis.duplicatedModules.slice(0, 5).forEach(dup => {
        console.log(`  ${dup}`);
      });
      if (analysis.duplicatedModules.length > 5) {
        console.log(`  ... and ${analysis.duplicatedModules.length - 5} more`);
      }
      console.log();
    } else {
      console.log('✅ No significant export duplication detected\n');
    }
  }

  private analyzeTreeShaking(importMap: Map<string, ImportAnalysis>, analysis: BundleAnalysis): void {
    const allExports = new Set<string>();
    const usedImports = new Set<string>();
    
    for (const data of importMap.values()) {
      data.exports.forEach(exp => allExports.add(exp));
      data.imports.forEach(imp => {
        if (imp.startsWith('@/') || imp.startsWith('./') || imp.startsWith('../')) {
          usedImports.add(imp);
        }
      });
    }

    const totalExports = allExports.size;
    const usedExportsCount = usedImports.size;
    
    analysis.treeShakingEffectiveness = totalExports > 0 ? (usedExportsCount / totalExports) * 100 : 100;
    
    console.log(`🌳 Tree-shaking Analysis:`);
    console.log(`  Total exports: ${totalExports}`);
    console.log(`  Used imports: ${usedExportsCount}`);
    console.log(`  Effectiveness: ${analysis.treeShakingEffectiveness.toFixed(1)}%\n`);
  }

  private async checkCircularDependencies(analysis: BundleAnalysis): Promise<void> {
    console.log('🔄 Checking for circular dependencies...\n');
    
    try {
      // Use madge to detect circular dependencies
      const result = execSync('npx madge --circular --extensions ts,tsx --exclude "node_modules|.next" .', {
        encoding: 'utf-8',
        timeout: 30000
      });
      
      if (result.trim()) {
        analysis.circularDependencies = result.trim().split('\n');
        console.log('⚠️  Circular Dependencies Found:');
        analysis.circularDependencies.forEach(dep => {
          console.log(`  ${dep}`);
        });
      } else {
        console.log('✅ No circular dependencies detected');
      }
    } catch (error) {
      console.log('ℹ️  Could not check circular dependencies (madge not available)');
    }
    console.log();
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async generateReport(): Promise<void> {
    const analysis = await this.analyzeBundleSize();
    
    console.log('📋 Bundle Analysis Summary:');
    console.log('=' .repeat(50));
    console.log(`Total Bundle Size: ${this.formatBytes(analysis.totalSize)}`);
    console.log(`Tree-shaking Effectiveness: ${analysis.treeShakingEffectiveness.toFixed(1)}%`);
    console.log(`Potential Duplications: ${analysis.duplicatedModules.length}`);
    console.log(`Circular Dependencies: ${analysis.circularDependencies.length}`);
    
    if (analysis.circularDependencies.length === 0 && 
        analysis.duplicatedModules.length < 5 && 
        analysis.treeShakingEffectiveness > 80) {
      console.log('\n✅ Bundle analysis looks healthy!');
    } else {
      console.log('\n⚠️  Some areas for improvement detected.');
    }
  }
}

// Run the analysis
const analyzer = new BundleAnalyzer();
analyzer.generateReport().catch(console.error);