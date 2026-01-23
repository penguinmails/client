#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const LinkValidator = require("./link-validator");

/**
 * Script to identify and fix broken links in active documentation
 * Focuses on current documentation and main README
 */

class LinkFixer {
  constructor() {
    this.validator = new LinkValidator();
    this.fixes = [];
    this.manualReviewNeeded = [];
  }

  /**
   * Get list of active documentation files (non-migration)
   */
  getActiveDocumentationFiles() {
    const activeFiles = [];

    // Always include main README
    if (fs.existsSync("README.md")) {
      activeFiles.push({
        path: "README.md",
        fullPath: path.resolve("README.md"),
      });
    }

    // Scan docs directory for current documentation
    const docsPath = "docs";
    if (fs.existsSync(docsPath)) {
      this.scanForActiveFiles(docsPath, activeFiles);
    }

    // Include component documentation
    const componentsPath = "components";
    if (fs.existsSync(componentsPath)) {
      this.scanForActiveFiles(componentsPath, activeFiles, true);
    }

    return activeFiles;
  }

  /**
   * Scan directory for active (non-migration) documentation files
   */
  scanForActiveFiles(dirPath, fileList, isComponentDir = false) {
    try {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          // Skip archive directories and node_modules
          if (
            item !== "archive" &&
            item !== "node_modules" &&
            item !== ".git"
          ) {
            this.scanForActiveFiles(fullPath, fileList, isComponentDir);
          }
        } else if (item.endsWith(".md")) {
          // Skip migration-related files
          const relativePath = path.relative(".", fullPath);
          if (!this.isMigrationFile(relativePath)) {
            fileList.push({
              path: relativePath,
              fullPath: fullPath,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error.message);
    }
  }

  /**
   * Check if file is migration-related
   */
  isMigrationFile(filePath) {
    const migrationPatterns = [
      /fsd-/i,
      /migration/i,
      /violations/i,
      /cleanup/i,
      /archive/i,
      /deprecated/i,
      /legacy/i,
    ];

    return migrationPatterns.some((pattern) => pattern.test(filePath));
  }

  /**
   * Analyze broken links and determine fixes
   */
  analyzeBrokenLinks(brokenLinks) {
    const fixes = [];
    const manualReview = [];

    for (const link of brokenLinks) {
      if (link.isExternal) {
        // External links need manual review
        manualReview.push({
          type: "external",
          link: link,
          suggestion: "Review and update or remove dead external link",
        });
      } else {
        // Try to find fixes for internal links
        const fix = this.findInternalLinkFix(link);
        if (fix) {
          fixes.push(fix);
        } else {
          manualReview.push({
            type: "internal",
            link: link,
            suggestion: "Could not auto-fix - manual review needed",
          });
        }
      }
    }

    return { fixes, manualReview };
  }

  /**
   * Find potential fix for broken internal link
   */
  findInternalLinkFix(link) {
    const targetPath = link.url.split("#")[0]; // Remove anchor

    // Common fixes for moved files
    const commonMoves = {
      "docs/README.md": "docs/guides/README.md",
      "docs/analytics/README.md": "docs/architecture/README.md",
      "docs/development/README.md": "docs/guides/README.md",
      "docs/development/authentication.md":
        "docs/architecture/authentication.md",
      "docs/development/testing.md": "docs/testing/README.md",
      "docs/development/troubleshooting.md": "docs/guides/troubleshooting.md",
      "docs/development/migration-patterns.md":
        "docs/archive/migration/migration-patterns.md",
      "docs/infrastructure/cloudflare.md": "docs/infrastructure/dns-setup.md",
      "docs/development/type-analysis.md": "docs/guides/type-analysis.md",
    };

    // Check if we have a known fix
    if (commonMoves[targetPath]) {
      const newPath = commonMoves[targetPath];
      if (fs.existsSync(newPath)) {
        return {
          type: "path_update",
          sourceFile: link.sourceFile,
          oldUrl: link.url,
          newUrl: link.url.replace(targetPath, newPath),
          lineNumber: link.lineNumber,
          linkText: link.text,
        };
      }
    }

    // Try to find similar files
    const similarFile = this.findSimilarFile(targetPath);
    if (similarFile) {
      return {
        type: "similar_file",
        sourceFile: link.sourceFile,
        oldUrl: link.url,
        newUrl: link.url.replace(targetPath, similarFile),
        lineNumber: link.lineNumber,
        linkText: link.text,
        confidence: "medium",
      };
    }

    return null;
  }

  /**
   * Find similar file that might be the intended target
   */
  findSimilarFile(targetPath) {
    const basename = path.basename(targetPath, ".md");
    const dirname = path.dirname(targetPath);

    // Search for files with similar names
    const searchPaths = [
      "docs/guides",
      "docs/architecture",
      "docs/infrastructure",
      "docs/testing",
      "docs/features",
    ];

    for (const searchPath of searchPaths) {
      if (fs.existsSync(searchPath)) {
        const files = this.getAllMarkdownFiles(searchPath);
        for (const file of files) {
          const fileBasename = path.basename(file, ".md");
          if (
            fileBasename.toLowerCase().includes(basename.toLowerCase()) ||
            basename.toLowerCase().includes(fileBasename.toLowerCase())
          ) {
            return file;
          }
        }
      }
    }

    return null;
  }

  /**
   * Get all markdown files in directory recursively
   */
  getAllMarkdownFiles(dirPath) {
    const files = [];

    try {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory() && item !== "archive") {
          files.push(...this.getAllMarkdownFiles(fullPath));
        } else if (item.endsWith(".md")) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors for non-existent directories
    }

    return files;
  }

  /**
   * Apply automatic fixes to files
   */
  async applyFixes(fixes) {
    const appliedFixes = [];
    const failedFixes = [];

    for (const fix of fixes) {
      try {
        const content = fs.readFileSync(fix.sourceFile, "utf8");
        const updatedContent = content.replace(
          new RegExp(
            `\\[${this.escapeRegex(fix.linkText)}\\]\\(${this.escapeRegex(fix.oldUrl)}\\)`,
            "g",
          ),
          `[${fix.linkText}](${fix.newUrl})`,
        );

        if (updatedContent !== content) {
          fs.writeFileSync(fix.sourceFile, updatedContent);
          appliedFixes.push(fix);
          console.log(
            `✓ Fixed link in ${fix.sourceFile}: ${fix.oldUrl} → ${fix.newUrl}`,
          );
        }
      } catch (error) {
        failedFixes.push({ fix, error: error.message });
        console.error(
          `✗ Failed to fix link in ${fix.sourceFile}:`,
          error.message,
        );
      }
    }

    return { appliedFixes, failedFixes };
  }

  /**
   * Escape special regex characters
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Generate report of fixes and manual review items
   */
  generateReport(appliedFixes, failedFixes, manualReview) {
    const report = {
      summary: {
        totalBrokenLinks: this.validator.brokenLinks.length,
        automaticFixes: appliedFixes.length,
        failedFixes: failedFixes.length,
        manualReviewNeeded: manualReview.length,
      },
      appliedFixes: appliedFixes,
      failedFixes: failedFixes,
      manualReview: manualReview,
      recommendations: [],
    };

    // Generate recommendations
    if (manualReview.length > 0) {
      report.recommendations.push(
        "Review and manually fix the links listed in manualReview section",
      );
    }
    if (failedFixes.length > 0) {
      report.recommendations.push(
        "Investigate failed automatic fixes and apply manually",
      );
    }
    if (appliedFixes.length > 0) {
      report.recommendations.push(
        "Verify that automatically fixed links work correctly",
      );
    }

    return report;
  }

  /**
   * Main execution function
   */
  async run() {
    console.log("🔍 Scanning for active documentation files...");
    const activeFiles = this.getActiveDocumentationFiles();
    console.log(`Found ${activeFiles.length} active documentation files`);

    console.log("\n📋 Extracting and validating links...");
    await this.validator.scanFiles(activeFiles);
    await this.validator.validateLinks();

    if (this.validator.brokenLinks.length === 0) {
      console.log("✅ No broken links found in active documentation!");
      return;
    }

    console.log(
      `\n🔧 Analyzing ${this.validator.brokenLinks.length} broken links...`,
    );
    const { fixes, manualReview } = this.analyzeBrokenLinks(
      this.validator.brokenLinks,
    );

    console.log(`\n⚡ Applying ${fixes.length} automatic fixes...`);
    const { appliedFixes, failedFixes } = await this.applyFixes(fixes);

    console.log("\n📊 Generating report...");
    const report = this.generateReport(appliedFixes, failedFixes, manualReview);

    // Export report
    fs.writeFileSync("link-fix-report.json", JSON.stringify(report, null, 2));

    console.log("\n" + "=".repeat(60));
    console.log("📋 LINK FIX SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total broken links found: ${report.summary.totalBrokenLinks}`);
    console.log(`Automatically fixed: ${report.summary.automaticFixes}`);
    console.log(`Failed to fix: ${report.summary.failedFixes}`);
    console.log(`Manual review needed: ${report.summary.manualReviewNeeded}`);

    if (manualReview.length > 0) {
      console.log("\n🔍 MANUAL REVIEW NEEDED:");
      for (const item of manualReview.slice(0, 10)) {
        // Show first 10
        console.log(
          `  • ${item.link.sourceFile}:${item.link.lineNumber} - ${item.link.url}`,
        );
        console.log(`    ${item.suggestion}`);
      }
      if (manualReview.length > 10) {
        console.log(
          `    ... and ${manualReview.length - 10} more (see link-fix-report.json)`,
        );
      }
    }

    console.log(`\n📄 Full report saved to: link-fix-report.json`);
  }
}

// Run if executed directly
if (require.main === module) {
  const fixer = new LinkFixer();
  fixer.run().catch(console.error);
}

module.exports = LinkFixer;
