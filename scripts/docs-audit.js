#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Documentation audit script to scan and categorize all .md files
 * Categorizes files by type: migration, current, component, performance
 */

class DocumentationAuditor {
  constructor() {
    this.files = [];
    this.categories = {
      migration: [],
      current: [],
      component: [],
      performance: [],
      archive: [],
      other: [],
    };

    // Patterns for categorizing files
    this.patterns = {
      migration: [
        /fsd-/i,
        /migration/i,
        /violations/i,
        /cleanup/i,
        /fix/i,
        /resolution/i,
      ],
      component: [/^components\//, /component/i, /ui/i, /design-system/i],
      performance: [/performance/i, /bundle/i, /optimization/i, /analysis/i],
      archive: [/archive/i, /deprecated/i, /old/i, /legacy/i],
    };
  }

  /**
   * Recursively scan directory for .md files
   */
  scanDirectory(dirPath, relativePath = "") {
    try {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativeFilePath = path.join(relativePath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          // Skip node_modules and .git directories
          if (item !== "node_modules" && item !== ".git" && item !== ".next") {
            this.scanDirectory(fullPath, relativeFilePath);
          }
        } else if (item.endsWith(".md")) {
          this.processMarkdownFile(fullPath, relativeFilePath, stats);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error.message);
    }
  }

  /**
   * Process individual markdown file and extract metadata
   */
  processMarkdownFile(fullPath, relativePath, stats) {
    try {
      const content = fs.readFileSync(fullPath, "utf8");
      const fileInfo = {
        path: relativePath,
        fullPath: fullPath,
        name: path.basename(relativePath),
        directory: path.dirname(relativePath),
        size: stats.size,
        lastModified: stats.mtime,
        category: this.categorizeFile(relativePath, content),
        lineCount: content.split("\n").length,
        wordCount: content.split(/\s+/).length,
        hasTitle: this.extractTitle(content) !== null,
        title: this.extractTitle(content),
      };

      this.files.push(fileInfo);
      this.categories[fileInfo.category].push(fileInfo);
    } catch (error) {
      console.error(`Error processing file ${relativePath}:`, error.message);
    }
  }

  /**
   * Categorize file based on path and content patterns
   */
  categorizeFile(filePath, content) {
    const lowerPath = filePath.toLowerCase();
    const lowerContent = content.toLowerCase();

    // Check migration patterns
    for (const pattern of this.patterns.migration) {
      if (pattern.test(lowerPath) || pattern.test(lowerContent)) {
        return "migration";
      }
    }

    // Check archive patterns
    for (const pattern of this.patterns.archive) {
      if (pattern.test(lowerPath)) {
        return "archive";
      }
    }

    // Check component patterns
    for (const pattern of this.patterns.component) {
      if (pattern.test(lowerPath)) {
        return "component";
      }
    }

    // Check performance patterns
    for (const pattern of this.patterns.performance) {
      if (pattern.test(lowerPath)) {
        return "performance";
      }
    }

    // Default to current documentation
    return "current";
  }

  /**
   * Extract title from markdown content
   */
  extractTitle(content) {
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        return trimmed.substring(2).trim();
      }
    }
    return null;
  }

  /**
   * Generate statistics about the documentation
   */
  generateStats() {
    const stats = {
      totalFiles: this.files.length,
      totalSize: this.files.reduce((sum, file) => sum + file.size, 0),
      totalLines: this.files.reduce((sum, file) => sum + file.lineCount, 0),
      totalWords: this.files.reduce((sum, file) => sum + file.wordCount, 0),
      categoryCounts: {},
      directoryCounts: {},
      filesWithoutTitles: this.files.filter((f) => !f.hasTitle).length,
      largestFiles: this.files.sort((a, b) => b.size - a.size).slice(0, 10),
      oldestFiles: this.files
        .sort((a, b) => a.lastModified - b.lastModified)
        .slice(0, 10),
      newestFiles: this.files
        .sort((a, b) => b.lastModified - a.lastModified)
        .slice(0, 10),
    };

    // Count by category
    for (const [category, files] of Object.entries(this.categories)) {
      stats.categoryCounts[category] = files.length;
    }

    // Count by directory
    const dirCounts = {};
    for (const file of this.files) {
      const dir = file.directory === "." ? "root" : file.directory;
      dirCounts[dir] = (dirCounts[dir] || 0) + 1;
    }
    stats.directoryCounts = dirCounts;

    return stats;
  }

  /**
   * Run the complete audit process
   */
  audit(rootPath = ".") {
    console.log("Starting documentation audit...");
    this.scanDirectory(rootPath);

    const stats = this.generateStats();

    console.log(`\nAudit complete! Found ${stats.totalFiles} markdown files.`);
    console.log("Category breakdown:");
    for (const [category, count] of Object.entries(stats.categoryCounts)) {
      console.log(`  ${category}: ${count} files`);
    }

    return {
      files: this.files,
      categories: this.categories,
      stats: stats,
    };
  }

  /**
   * Export audit results to JSON file
   */
  exportResults(results, outputPath = "docs-audit-results.json") {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
      console.log(`\nResults exported to ${outputPath}`);
    } catch (error) {
      console.error("Error exporting results:", error.message);
    }
  }
}

// Run audit if script is executed directly
if (require.main === module) {
  const auditor = new DocumentationAuditor();
  const results = auditor.audit();
  auditor.exportResults(results);
}

module.exports = DocumentationAuditor;
