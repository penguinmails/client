#!/usr/bin/env node

/**
 * Content Freshness Validation Tool
 *
 * Validates documentation content freshness by checking:
 * - File modification dates
 * - Content staleness indicators
 * - Outdated references and links
 * - Version-specific content that may be obsolete
 *
 * Requirements: 6.3 - Implement content freshness validation
 */

const fs = require("fs");
const path = require("path");

class ContentFreshnessValidator {
  constructor(options = {}) {
    this.rootPath = options.rootPath || ".";
    this.maxAge = options.maxAge || 365; // days
    this.warningAge = options.warningAge || 180; // days

    // Patterns that indicate potentially outdated content
    this.staleContentPatterns = [
      /next\.js\s+1[0-4]/i, // Old Next.js versions
      /react\s+1[0-7]/i, // Old React versions
      /node\.js\s+1[0-6]/i, // Old Node versions
      /typescript\s+[0-4]\./i, // Old TypeScript versions
      /\b20(1[0-9]|2[0-2])\b/, // Years 2010-2022
      /deprecated/i, // Deprecated content
      /legacy/i, // Legacy content
      /old\s+way/i, // "Old way" references
      /no\s+longer/i, // "No longer" references
      /used\s+to/i, // "Used to" references
    ];

    // Technology version patterns to check
    this.versionPatterns = {
      nextjs: /next\.js\s+(\d+)/i,
      react: /react\s+(\d+)/i,
      nodejs: /node\.js\s+(\d+)/i,
      typescript: /typescript\s+(\d+\.\d+)/i,
    };

    // Current expected versions (should be configurable)
    this.currentVersions = {
      nextjs: 15,
      react: 19,
      nodejs: 18,
      typescript: 5.0,
    };
  }

  /**
   * Validate content freshness for all documentation
   */
  async validateContentFreshness() {
    console.log("📅 Content Freshness Validation");
    console.log("==============================\n");

    const results = {
      totalFiles: 0,
      freshFiles: [],
      staleFiles: [],
      outdatedFiles: [],
      contentIssues: [],
      versionIssues: [],
      summary: null,
    };

    try {
      // Scan all markdown files
      const files = this.scanMarkdownFiles(this.rootPath);
      results.totalFiles = files.length;

      console.log(`Found ${files.length} markdown files to analyze...\n`);

      // Analyze each file
      for (const file of files) {
        const analysis = await this.analyzeFile(file);

        // Categorize by age
        if (analysis.ageDays <= this.warningAge) {
          results.freshFiles.push(analysis);
        } else if (analysis.ageDays <= this.maxAge) {
          results.staleFiles.push(analysis);
        } else {
          results.outdatedFiles.push(analysis);
        }

        // Collect content and version issues
        if (analysis.contentIssues.length > 0) {
          results.contentIssues.push(...analysis.contentIssues);
        }

        if (analysis.versionIssues.length > 0) {
          results.versionIssues.push(...analysis.versionIssues);
        }
      }

      // Generate summary
      results.summary = this.generateSummary(results);

      // Display results
      this.displayResults(results);

      return results;
    } catch (error) {
      console.error("❌ Content freshness validation failed:", error.message);
      throw error;
    }
  }

  /**
   * Scan directory for markdown files
   */
  scanMarkdownFiles(dirPath, files = []) {
    try {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativePath = path.relative(this.rootPath, fullPath);

        // Skip certain directories
        if (this.shouldSkipDirectory(item)) {
          continue;
        }

        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          this.scanMarkdownFiles(fullPath, files);
        } else if (item.endsWith(".md")) {
          files.push({
            path: relativePath,
            fullPath: fullPath,
            name: item,
            stats: stats,
          });
        }
      }

      return files;
    } catch (error) {
      console.error(`Error scanning ${dirPath}:`, error.message);
      return files;
    }
  }

  /**
   * Check if directory should be skipped
   */
  shouldSkipDirectory(dirName) {
    const skipDirs = ["node_modules", ".git", ".next", "dist", "build"];
    return skipDirs.includes(dirName);
  }

  /**
   * Analyze individual file for freshness
   */
  async analyzeFile(file) {
    try {
      const content = fs.readFileSync(file.fullPath, "utf8");
      const now = new Date();
      const ageMs = now - file.stats.mtime;
      const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));

      const analysis = {
        ...file,
        ageDays,
        ageCategory: this.categorizeAge(ageDays),
        lastModified: file.stats.mtime,
        contentIssues: [],
        versionIssues: [],
        staleContentFound: false,
        outdatedVersionsFound: false,
      };

      // Check for stale content patterns
      analysis.contentIssues = this.findStaleContent(content, file.path);
      analysis.staleContentFound = analysis.contentIssues.length > 0;

      // Check for outdated version references
      analysis.versionIssues = this.findOutdatedVersions(content, file.path);
      analysis.outdatedVersionsFound = analysis.versionIssues.length > 0;

      return analysis;
    } catch (error) {
      console.error(`Error analyzing ${file.path}:`, error.message);
      return {
        ...file,
        ageDays: 0,
        ageCategory: "error",
        contentIssues: [],
        versionIssues: [],
        error: error.message,
      };
    }
  }

  /**
   * Find stale content patterns in file
   */
  findStaleContent(content, filePath) {
    const issues = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      for (const pattern of this.staleContentPatterns) {
        if (pattern.test(line)) {
          issues.push({
            file: filePath,
            lineNumber,
            line: line.trim(),
            pattern: pattern.source,
            type: "stale-content",
            severity: this.getPatternSeverity(pattern),
          });
        }
      }
    }

    return issues;
  }

  /**
   * Find outdated version references
   */
  findOutdatedVersions(content, filePath) {
    const issues = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      for (const [tech, pattern] of Object.entries(this.versionPatterns)) {
        const match = pattern.exec(line);
        if (match) {
          const version = parseFloat(match[1]);
          const currentVersion = this.currentVersions[tech];

          if (version < currentVersion) {
            issues.push({
              file: filePath,
              lineNumber,
              line: line.trim(),
              technology: tech,
              foundVersion: version,
              currentVersion: currentVersion,
              type: "outdated-version",
              severity: this.getVersionSeverity(version, currentVersion),
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Get severity level for stale content pattern
   */
  getPatternSeverity(pattern) {
    const highSeverityPatterns = [/deprecated/i, /legacy/i, /no\s+longer/i];

    for (const highPattern of highSeverityPatterns) {
      if (pattern.source.includes(highPattern.source)) {
        return "high";
      }
    }

    return "medium";
  }

  /**
   * Get severity level for version differences
   */
  getVersionSeverity(foundVersion, currentVersion) {
    const diff = currentVersion - foundVersion;

    if (diff >= 3) return "high";
    if (diff >= 2) return "medium";
    return "low";
  }

  /**
   * Categorize file age
   */
  categorizeAge(ageDays) {
    if (ageDays <= 30) return "fresh";
    if (ageDays <= this.warningAge) return "recent";
    if (ageDays <= this.maxAge) return "stale";
    return "outdated";
  }

  /**
   * Generate summary statistics
   */
  generateSummary(results) {
    const totalIssues =
      results.contentIssues.length + results.versionIssues.length;
    const highSeverityIssues = [
      ...results.contentIssues,
      ...results.versionIssues,
    ].filter((issue) => issue.severity === "high").length;

    let status = "PASS";
    if (
      highSeverityIssues > 0 ||
      results.outdatedFiles.length > results.totalFiles * 0.3
    ) {
      status = "FAIL";
    } else if (totalIssues > 0 || results.staleFiles.length > 0) {
      status = "WARNING";
    }

    return {
      status,
      totalFiles: results.totalFiles,
      freshFiles: results.freshFiles.length,
      staleFiles: results.staleFiles.length,
      outdatedFiles: results.outdatedFiles.length,
      totalIssues,
      contentIssues: results.contentIssues.length,
      versionIssues: results.versionIssues.length,
      highSeverityIssues,
      recommendations: this.generateRecommendations(results),
    };
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(results) {
    const recommendations = [];

    if (results.outdatedFiles.length > 0) {
      recommendations.push(
        `Review and update ${results.outdatedFiles.length} outdated files (>365 days old)`,
      );
    }

    if (results.contentIssues.length > 0) {
      recommendations.push(
        `Address ${results.contentIssues.length} stale content references`,
      );
    }

    if (results.versionIssues.length > 0) {
      recommendations.push(
        `Update ${results.versionIssues.length} outdated version references`,
      );
    }

    if (results.staleFiles.length > 0) {
      recommendations.push(
        `Consider reviewing ${results.staleFiles.length} files that haven't been updated recently`,
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Documentation content appears fresh and up-to-date",
      );
    }

    return recommendations;
  }

  /**
   * Display validation results
   */
  displayResults(results) {
    console.log("📊 Content Freshness Results");
    console.log("============================\n");

    // File age summary
    console.log("📁 File Age Distribution:");
    console.log(`   Fresh (≤30 days): ${results.freshFiles.length}`);
    console.log(
      `   Recent (≤${this.warningAge} days): ${results.staleFiles.length}`,
    );
    console.log(
      `   Outdated (>${this.maxAge} days): ${results.outdatedFiles.length}\n`,
    );

    // Content issues
    if (results.contentIssues.length > 0) {
      console.log("⚠️  Stale Content Issues:");
      const groupedIssues = this.groupIssuesByFile(results.contentIssues);
      for (const [file, issues] of Object.entries(groupedIssues)) {
        console.log(`   ${file}:`);
        for (const issue of issues) {
          console.log(`     Line ${issue.lineNumber}: ${issue.line}`);
        }
      }
      console.log();
    }

    // Version issues
    if (results.versionIssues.length > 0) {
      console.log("📦 Outdated Version References:");
      const groupedVersions = this.groupIssuesByFile(results.versionIssues);
      for (const [file, issues] of Object.entries(groupedVersions)) {
        console.log(`   ${file}:`);
        for (const issue of issues) {
          console.log(
            `     Line ${issue.lineNumber}: ${issue.technology} ${issue.foundVersion} → ${issue.currentVersion}`,
          );
        }
      }
      console.log();
    }

    // Summary
    console.log(
      `📋 Summary: ${results.summary.status === "PASS" ? "✅" : results.summary.status === "WARNING" ? "⚠️" : "❌"} ${results.summary.status}`,
    );
    console.log(`   Total Issues: ${results.summary.totalIssues}`);
    console.log(`   High Severity: ${results.summary.highSeverityIssues}\n`);

    // Recommendations
    console.log("💡 Recommendations:");
    for (const rec of results.summary.recommendations) {
      console.log(`   • ${rec}`);
    }
  }

  /**
   * Group issues by file for display
   */
  groupIssuesByFile(issues) {
    const grouped = {};
    for (const issue of issues) {
      if (!grouped[issue.file]) {
        grouped[issue.file] = [];
      }
      grouped[issue.file].push(issue);
    }
    return grouped;
  }

  /**
   * Export results to JSON
   */
  exportResults(results, outputPath = "content-freshness-results.json") {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
      console.log(`\n📄 Results exported to: ${outputPath}`);
    } catch (error) {
      console.error("❌ Error exporting results:", error.message);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--max-age":
        options.maxAge = parseInt(args[++i]) || 365;
        break;
      case "--warning-age":
        options.warningAge = parseInt(args[++i]) || 180;
        break;
      case "--root":
        options.rootPath = args[++i] || ".";
        break;
      case "--export":
        options.exportPath = args[++i];
        break;
      case "--help":
        console.log(`
Content Freshness Validation Tool

Usage: node content-freshness-validator.js [options]

Options:
  --max-age <days>      Maximum age before content is considered outdated (default: 365)
  --warning-age <days>  Age threshold for warnings (default: 180)
  --root <path>         Root path for validation (default: .)
  --export <path>       Export results to JSON file
  --help                Show this help message

Examples:
  node content-freshness-validator.js
  node content-freshness-validator.js --max-age 180 --warning-age 90
  node content-freshness-validator.js --export freshness-report.json
        `);
        return;
    }
  }

  try {
    const validator = new ContentFreshnessValidator(options);
    const results = await validator.validateContentFreshness();

    if (options.exportPath) {
      validator.exportResults(results, options.exportPath);
    }

    // Exit with appropriate code
    const status = results.summary?.status;
    if (status === "FAIL") {
      process.exit(1);
    } else if (status === "WARNING") {
      process.exit(0); // Warnings don't fail CI
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Validation failed:", error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = ContentFreshnessValidator;

// Run if called directly
if (require.main === module) {
  main();
}
