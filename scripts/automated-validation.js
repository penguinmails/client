#!/usr/bin/env node

/**
 * Automated Documentation Validation Tools
 *
 * This script provides comprehensive automated validation for documentation:
 * 1. Link checking (internal and external)
 * 2. Content freshness validation
 * 3. Structure validation for required README files
 *
 * Requirements: 6.3 - Create automated checks for broken links and outdated content
 */

const fs = require("fs");
const path = require("path");
const DocumentationAuditor = require("./docs-audit.js");
const LinkValidator = require("./link-validator.js");

class AutomatedDocumentationValidator {
  constructor(options = {}) {
    this.rootPath = options.rootPath || ".";
    this.maxAge = options.maxAge || 365; // days
    this.requiredReadmeDirectories = options.requiredReadmeDirectories || [
      "docs",
      "docs/architecture",
      "docs/guides",
      "docs/features",
      "docs/infrastructure",
      "docs/testing",
      "docs/performance",
      "docs/components",
      "docs/maintenance",
      "docs/archive",
      "docs/archive/migration",
      "docs/archive/temporary",
    ];

    this.results = {
      linkValidation: null,
      freshnessValidation: null,
      structureValidation: null,
      summary: null,
    };
  }

  /**
   * Run all validation checks
   */
  async runAllValidations() {
    console.log("🔍 Starting Automated Documentation Validation");
    console.log("==============================================\n");

    try {
      // 1. Run link validation
      await this.validateLinks();

      // 2. Run content freshness validation
      await this.validateContentFreshness();

      // 3. Run structure validation
      await this.validateStructure();

      // 4. Generate summary report
      this.generateSummaryReport();

      // 5. Export results
      this.exportResults();

      console.log("\n✅ All validation checks completed successfully!");
      return this.results;
    } catch (error) {
      console.error("❌ Validation failed:", error.message);
      throw error;
    }
  }

  /**
   * Validate all documentation links
   */
  async validateLinks() {
    console.log("🔗 Running Link Validation...");

    try {
      // Get all markdown files using existing auditor
      const auditor = new DocumentationAuditor();
      const auditResults = auditor.audit(this.rootPath);

      // Validate links using existing validator
      const linkValidator = new LinkValidator();
      await linkValidator.scanFiles(auditResults.files);
      await linkValidator.validateLinks(this.rootPath);

      this.results.linkValidation = {
        totalLinks: linkValidator.links.length,
        validLinks: linkValidator.validLinks.length,
        brokenLinks: linkValidator.brokenLinks.length,
        brokenLinkDetails: linkValidator.brokenLinks,
        brokenLinksByFile: this.groupBrokenLinksByFile(
          linkValidator.brokenLinks,
        ),
        status: linkValidator.brokenLinks.length === 0 ? "PASS" : "FAIL",
      };

      console.log(`   ✓ Checked ${linkValidator.links.length} links`);
      console.log(`   ✓ Valid: ${linkValidator.validLinks.length}`);
      console.log(
        `   ${linkValidator.brokenLinks.length > 0 ? "❌" : "✅"} Broken: ${linkValidator.brokenLinks.length}`,
      );
    } catch (error) {
      console.error("   ❌ Link validation failed:", error.message);
      this.results.linkValidation = {
        status: "ERROR",
        error: error.message,
      };
    }
  }

  /**
   * Validate content freshness (check for outdated content)
   */
  async validateContentFreshness() {
    console.log("\n📅 Running Content Freshness Validation...");

    try {
      const auditor = new DocumentationAuditor();
      const auditResults = auditor.audit(this.rootPath);

      const now = new Date();
      const maxAgeMs = this.maxAge * 24 * 60 * 60 * 1000; // Convert days to milliseconds

      const outdatedFiles = [];
      const recentFiles = [];
      const noDateFiles = [];

      for (const file of auditResults.files) {
        const ageMs = now - file.lastModified;
        const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));

        if (ageMs > maxAgeMs) {
          outdatedFiles.push({
            ...file,
            ageDays,
            ageCategory: this.categorizeAge(ageDays),
          });
        } else {
          recentFiles.push({
            ...file,
            ageDays,
          });
        }
      }

      // Check for files that might need date metadata
      const filesNeedingAttention = outdatedFiles.filter(
        (file) =>
          !file.path.includes("archive/") && // Exclude archived files
          !file.path.includes("README.md") && // Exclude README files
          file.ageDays > this.maxAge,
      );

      this.results.freshnessValidation = {
        totalFiles: auditResults.files.length,
        recentFiles: recentFiles.length,
        outdatedFiles: outdatedFiles.length,
        filesNeedingAttention: filesNeedingAttention.length,
        outdatedFileDetails: outdatedFiles,
        filesNeedingAttentionDetails: filesNeedingAttention,
        maxAgeDays: this.maxAge,
        status: filesNeedingAttention.length === 0 ? "PASS" : "WARNING",
      };

      console.log(`   ✓ Analyzed ${auditResults.files.length} files`);
      console.log(`   ✓ Recent (< ${this.maxAge} days): ${recentFiles.length}`);
      console.log(
        `   ${filesNeedingAttention.length > 0 ? "⚠️" : "✅"} Potentially outdated: ${filesNeedingAttention.length}`,
      );
    } catch (error) {
      console.error(
        "   ❌ Content freshness validation failed:",
        error.message,
      );
      this.results.freshnessValidation = {
        status: "ERROR",
        error: error.message,
      };
    }
  }

  /**
   * Validate documentation structure (required README files)
   */
  async validateStructure() {
    console.log("\n📁 Running Structure Validation...");

    try {
      const missingReadmes = [];
      const existingReadmes = [];
      const invalidReadmes = [];

      for (const dirPath of this.requiredReadmeDirectories) {
        const readmePath = path.join(this.rootPath, dirPath, "README.md");
        const fullDirPath = path.join(this.rootPath, dirPath);

        // Check if directory exists
        if (!fs.existsSync(fullDirPath)) {
          missingReadmes.push({
            directory: dirPath,
            readmePath: path.join(dirPath, "README.md"),
            issue: "Directory does not exist",
          });
          continue;
        }

        // Check if README exists
        if (!fs.existsSync(readmePath)) {
          missingReadmes.push({
            directory: dirPath,
            readmePath: path.join(dirPath, "README.md"),
            issue: "README.md missing",
          });
        } else {
          // Validate README content
          const content = fs.readFileSync(readmePath, "utf8");
          const validation = this.validateReadmeContent(content, dirPath);

          if (validation.isValid) {
            existingReadmes.push({
              directory: dirPath,
              readmePath: path.join(dirPath, "README.md"),
              hasTitle: validation.hasTitle,
              hasDescription: validation.hasDescription,
              wordCount: validation.wordCount,
            });
          } else {
            invalidReadmes.push({
              directory: dirPath,
              readmePath: path.join(dirPath, "README.md"),
              issues: validation.issues,
            });
          }
        }
      }

      this.results.structureValidation = {
        totalDirectories: this.requiredReadmeDirectories.length,
        existingReadmes: existingReadmes.length,
        missingReadmes: missingReadmes.length,
        invalidReadmes: invalidReadmes.length,
        missingReadmeDetails: missingReadmes,
        invalidReadmeDetails: invalidReadmes,
        existingReadmeDetails: existingReadmes,
        status:
          missingReadmes.length === 0 && invalidReadmes.length === 0
            ? "PASS"
            : "FAIL",
      };

      console.log(
        `   ✓ Checked ${this.requiredReadmeDirectories.length} directories`,
      );
      console.log(`   ✅ Valid READMEs: ${existingReadmes.length}`);
      console.log(
        `   ${missingReadmes.length > 0 ? "❌" : "✅"} Missing READMEs: ${missingReadmes.length}`,
      );
      console.log(
        `   ${invalidReadmes.length > 0 ? "❌" : "✅"} Invalid READMEs: ${invalidReadmes.length}`,
      );
    } catch (error) {
      console.error("   ❌ Structure validation failed:", error.message);
      this.results.structureValidation = {
        status: "ERROR",
        error: error.message,
      };
    }
  }

  /**
   * Validate README content quality
   */
  validateReadmeContent(content, dirPath) {
    const issues = [];
    let hasTitle = false;
    let hasDescription = false;

    // Check for title (# heading)
    if (content.match(/^#\s+.+$/m)) {
      hasTitle = true;
    } else {
      issues.push("Missing main title (# heading)");
    }

    // Check for description content
    const lines = content.split("\n").filter((line) => line.trim());
    if (lines.length > 2) {
      // More than just title
      hasDescription = true;
    } else {
      issues.push("Missing description content");
    }

    // Check minimum content length
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 10) {
      issues.push("Content too short (less than 10 words)");
    }

    return {
      isValid: issues.length === 0,
      hasTitle,
      hasDescription,
      wordCount,
      issues,
    };
  }

  /**
   * Categorize file age for reporting
   */
  categorizeAge(ageDays) {
    if (ageDays < 30) return "recent";
    if (ageDays < 90) return "moderate";
    if (ageDays < 365) return "old";
    return "very-old";
  }

  /**
   * Group broken links by source file
   */
  groupBrokenLinksByFile(brokenLinks) {
    const grouped = {};
    for (const link of brokenLinks) {
      if (!grouped[link.sourceFile]) {
        grouped[link.sourceFile] = [];
      }
      grouped[link.sourceFile].push(link);
    }
    return grouped;
  }

  /**
   * Generate overall summary report
   */
  generateSummaryReport() {
    console.log("\n📊 Generating Summary Report...");

    const linkStatus = this.results.linkValidation?.status || "ERROR";
    const freshnessStatus = this.results.freshnessValidation?.status || "ERROR";
    const structureStatus = this.results.structureValidation?.status || "ERROR";

    // Determine overall status
    let overallStatus = "PASS";
    if ([linkStatus, structureStatus].includes("FAIL")) {
      overallStatus = "FAIL";
    } else if (
      [linkStatus, freshnessStatus, structureStatus].includes("WARNING")
    ) {
      overallStatus = "WARNING";
    } else if (
      [linkStatus, freshnessStatus, structureStatus].includes("ERROR")
    ) {
      overallStatus = "ERROR";
    }

    const issues = [];
    const warnings = [];

    // Collect issues and warnings
    if (this.results.linkValidation?.brokenLinks > 0) {
      issues.push(
        `${this.results.linkValidation.brokenLinks} broken links found`,
      );
    }

    if (this.results.structureValidation?.missingReadmes > 0) {
      issues.push(
        `${this.results.structureValidation.missingReadmes} missing README files`,
      );
    }

    if (this.results.structureValidation?.invalidReadmes > 0) {
      issues.push(
        `${this.results.structureValidation.invalidReadmes} invalid README files`,
      );
    }

    if (this.results.freshnessValidation?.filesNeedingAttention > 0) {
      warnings.push(
        `${this.results.freshnessValidation.filesNeedingAttention} potentially outdated files`,
      );
    }

    this.results.summary = {
      overallStatus,
      validationDate: new Date().toISOString(),
      checks: {
        linkValidation: linkStatus,
        freshnessValidation: freshnessStatus,
        structureValidation: structureStatus,
      },
      issues,
      warnings,
      recommendations: this.generateRecommendations(),
    };

    console.log(
      `   Overall Status: ${overallStatus === "PASS" ? "✅" : overallStatus === "WARNING" ? "⚠️" : "❌"} ${overallStatus}`,
    );
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.results.linkValidation?.brokenLinks > 0) {
      recommendations.push(
        "Fix broken links by updating file paths or removing dead references",
      );
    }

    if (this.results.structureValidation?.missingReadmes > 0) {
      recommendations.push(
        "Create missing README.md files for documentation directories",
      );
    }

    if (this.results.structureValidation?.invalidReadmes > 0) {
      recommendations.push(
        "Improve README content with proper titles and descriptions",
      );
    }

    if (this.results.freshnessValidation?.filesNeedingAttention > 0) {
      recommendations.push("Review and update outdated documentation files");
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Documentation validation passed - maintain current quality standards",
      );
    }

    return recommendations;
  }

  /**
   * Export validation results to JSON file
   */
  exportResults(outputPath = "automated-validation-results.json") {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
      console.log(`\n📄 Validation results exported to: ${outputPath}`);
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
      case "--root":
        options.rootPath = args[++i] || ".";
        break;
      case "--help":
        console.log(`
Automated Documentation Validation Tool

Usage: node automated-validation.js [options]

Options:
  --max-age <days>    Maximum age for content freshness (default: 365)
  --root <path>       Root path for validation (default: .)
  --help              Show this help message

Examples:
  node automated-validation.js
  node automated-validation.js --max-age 180 --root ./docs
        `);
        return;
    }
  }

  try {
    const validator = new AutomatedDocumentationValidator(options);
    await validator.runAllValidations();

    // Exit with appropriate code
    const status = validator.results.summary?.overallStatus;
    if (status === "FAIL" || status === "ERROR") {
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
module.exports = AutomatedDocumentationValidator;

// Run if called directly
if (require.main === module) {
  main();
}
