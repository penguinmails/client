#!/usr/bin/env node

/**
 * Documentation Structure Validation Tool
 *
 * Validates documentation structure by checking:
 * - Required README.md files in documentation directories
 * - README content quality and completeness
 * - Directory structure consistency
 * - Navigation and cross-reference integrity
 *
 * Requirements: 6.3 - Set up structure validation for required README files
 */

const fs = require("fs");
const path = require("path");

class DocumentationStructureValidator {
  constructor(options = {}) {
    this.rootPath = options.rootPath || ".";

    // Required README files and their expected content
    this.requiredReadmes = {
      "docs/README.md": {
        title: "Documentation",
        description: "Main documentation index and navigation",
        requiredSections: [
          "Overview",
          "Getting Started",
          "Architecture",
          "Guides",
        ],
        minWordCount: 50,
      },
      "docs/architecture/README.md": {
        title: "Architecture Documentation",
        description: "System design and technical decisions",
        requiredSections: ["Overview", "Components"],
        minWordCount: 30,
      },
      "docs/guides/README.md": {
        title: "Development Guides",
        description: "Development workflows and best practices",
        requiredSections: ["Overview", "Available Guides"],
        minWordCount: 30,
      },
      "docs/features/README.md": {
        title: "Feature Documentation",
        description: "Feature-specific documentation",
        requiredSections: ["Overview", "Features"],
        minWordCount: 30,
      },
      "docs/infrastructure/README.md": {
        title: "Infrastructure Documentation",
        description: "Deployment and setup guides",
        requiredSections: ["Overview", "Setup"],
        minWordCount: 30,
      },
      "docs/testing/README.md": {
        title: "Testing Documentation",
        description: "Testing strategies and guides",
        requiredSections: ["Overview", "Testing Guides"],
        minWordCount: 30,
      },
      "docs/performance/README.md": {
        title: "Performance Documentation",
        description: "Performance monitoring and optimization",
        requiredSections: ["Overview", "Monitoring"],
        minWordCount: 30,
      },
      "docs/components/README.md": {
        title: "Component Documentation",
        description: "Compt documentation index",
        requiredSections: ["Overview", "Components"],
        minWordCount: 30,
      },
      "docs/maintenance/README.md": {
        title: "Documentation Maintenance",
        description: "Documentation maintenance guidelines",
        requiredSections: ["Overview", "Guidelines"],
        minWordCount: 30,
      },
      "docs/archive/README.md": {
        title: "Documentation Archive",
        description: "Historical and migration artifacts",
        requiredSections: ["Overview", "Contents"],
        minWordCount: 30,
      },
      "docs/archive/migration/README.md": {
        title: "Migration Documentation",
        description: "FSD migration and architectural transition documents",
        requiredSections: ["Overview", "Migration History"],
        minWordCount: 30,
      },
      "docs/archive/temporary/README.md": {
        title: "Temporary Documentation",
        description: "Temporary fixes and outdated implementation guides",
        requiredSections: ["Overview", "Temporary Files"],
        minWordCount: 30,
      },
    };

    // Optional README files that should exist if directories exist
    this.optionalReadmes = [
      "components/README.md",
      "lib/README.md",
      "hooks/README.md",
      "types/README.md",
    ];
  }

  /**
   * Validate documentation structure
   */
  async validateStructure() {
    console.log("📁 Documentation Structure Validation");
    console.log("====================================\n");

    const results = {
      requiredReadmes: [],
      optionalReadmes: [],
      missingReadmes: [],
      invalidReadmes: [],
      directoryStructure: {},
      summary: null,
    };

    try {
      // Validate required README files
      console.log("Checking required README files...");
      for (const [readmePath, requirements] of Object.entries(
        this.requiredReadmes,
      )) {
        const validation = await this.validateReadmeFile(
          readmePath,
          requirements,
        );

        if (validation.exists) {
          if (validation.isValid) {
            results.requiredReadmes.push(validation);
          } else {
            results.invalidReadmes.push(validation);
          }
        } else {
          results.missingReadmes.push(validation);
        }
      }

      // Check optional README files
      console.log("Checking optional README files...");
      for (const readmePath of this.optionalReadmes) {
        const dirPath = path.dirname(path.join(this.rootPath, readmePath));
        if (fs.existsSync(dirPath)) {
          const validation = await this.validateReadmeFile(readmePath, {
            title: "Documentation",
            description: "Directory documentation",
            requiredSections: [],
            minWordCount: 10,
          });
          results.optionalReadmes.push(validation);
        }
      }

      // Validate directory structure
      console.log("Analyzing directory structure...");
      results.directoryStructure = this.analyzeDirectoryStructure();

      // Generate summary
      results.summary = this.generateSummary(results);

      // Display results
      this.displayResults(results);

      return results;
    } catch (error) {
      console.error("❌ Structure validation failed:", error.message);
      throw error;
    }
  }

  /**
   * Validate individual README file
   */
  async validateReadmeFile(readmePath, requirements) {
    const fullPath = path.join(this.rootPath, readmePath);
    const dirPath = path.dirname(fullPath);

    const validation = {
      path: readmePath,
      fullPath: fullPath,
      requirements: requirements,
      exists: false,
      directoryExists: fs.existsSync(dirPath),
      isValid: false,
      issues: [],
      content: null,
      analysis: null,
    };

    // Check if README exists
    if (!fs.existsSync(fullPath)) {
      validation.issues.push("README.md file does not exist");
      return validation;
    }

    validation.exists = true;

    try {
      // Read and analyze content
      const content = fs.readFileSync(fullPath, "utf8");
      validation.content = content;
      validation.analysis = this.analyzeReadmeContent(content, requirements);

      // Check if valid based on analysis
      validation.isValid = validation.analysis.issues.length === 0;
      validation.issues = validation.analysis.issues;
    } catch (error) {
      validation.issues.push(`Error reading file: ${error.message}`);
    }

    return validation;
  }

  /**
   * Analyze README content quality
   */
  analyzeReadmeContent(content, requirements) {
    const analysis = {
      wordCount: 0,
      hasTitle: false,
      title: null,
      hasDescription: false,
      sections: [],
      requiredSectionsFound: [],
      missingSections: [],
      issues: [],
    };

    // Basic content analysis
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    analysis.wordCount = words.length;

    // Check word count
    if (analysis.wordCount < requirements.minWordCount) {
      analysis.issues.push(
        `Content too short: ${analysis.wordCount} words (minimum: ${requirements.minWordCount})`,
      );
    }

    // Extract title
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      analysis.hasTitle = true;
      analysis.title = titleMatch[1].trim();
    } else {
      analysis.issues.push("Missing main title (# heading)");
    }

    // Check for description (content after title)
    const lines = content.split("\n").filter((line) => line.trim());
    if (lines.length > 2) {
      analysis.hasDescription = true;
    } else {
      analysis.issues.push("Missing description content");
    }

    // Extract sections
    const sectionMatches = content.match(/^##\s+(.+)$/gm);
    if (sectionMatches) {
      analysis.sections = sectionMatches.map((match) =>
        match.replace(/^##\s+/, "").trim(),
      );
    }

    // Check required sections
    for (const requiredSection of requirements.requiredSections) {
      const found = analysis.sections.some((section) =>
        section.toLowerCase().includes(requiredSection.toLowerCase()),
      );

      if (found) {
        analysis.requiredSectionsFound.push(requiredSection);
      } else {
        analysis.missingSections.push(requiredSection);
        analysis.issues.push(`Missing required section: ${requiredSection}`);
      }
    }

    return analysis;
  }

  /**
   * Analyze overall directory structure
   */
  analyzeDirectoryStructure() {
    const structure = {
      docsDirectory: {
        exists: false,
        subdirectories: [],
      },
      expectedDirectories: [
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
      ],
      missingDirectories: [],
      extraDirectories: [],
    };

    const docsPath = path.join(this.rootPath, "docs");
    structure.docsDirectory.exists = fs.existsSync(docsPath);

    if (structure.docsDirectory.exists) {
      // Get actual subdirectories
      try {
        const items = fs.readdirSync(docsPath);
        for (const item of items) {
          const itemPath = path.join(docsPath, item);
          if (fs.statSync(itemPath).isDirectory()) {
            structure.docsDirectory.subdirectories.push(`docs/${item}`);
          }
        }
      } catch (error) {
        console.error("Error reading docs directory:", error.message);
      }

      // Check for missing expected directories
      for (const expectedDir of structure.expectedDirectories) {
        const fullPath = path.join(this.rootPath, expectedDir);
        if (!fs.existsSync(fullPath)) {
          structure.missingDirectories.push(expectedDir);
        }
      }

      // Find extra directories (not necessarily bad, just informational)
      for (const actualDir of structure.docsDirectory.subdirectories) {
        if (!structure.expectedDirectories.includes(actualDir)) {
          structure.extraDirectories.push(actualDir);
        }
      }
    }

    return structure;
  }

  /**
   * Generate summary statistics
   */
  generateSummary(results) {
    const totalRequired = Object.keys(this.requiredReadmes).length;
    const validRequired = results.requiredReadmes.length;
    const missingRequired = results.missingReadmes.length;
    const invalidRequired = results.invalidReadmes.length;

    let status = "PASS";
    if (missingRequired > 0 || invalidRequired > 0) {
      status = "FAIL";
    } else if (results.directoryStructure.missingDirectories.length > 0) {
      status = "WARNING";
    }

    return {
      status,
      totalRequiredReadmes: totalRequired,
      validRequiredReadmes: validRequired,
      missingRequiredReadmes: missingRequired,
      invalidRequiredReadmes: invalidRequired,
      optionalReadmesChecked: results.optionalReadmes.length,
      missingDirectories: results.directoryStructure.missingDirectories.length,
      recommendations: this.generateRecommendations(results),
    };
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(results) {
    const recommendations = [];

    if (results.missingReadmes.length > 0) {
      recommendations.push(
        `Create ${results.missingReadmes.length} missing README.md files`,
      );
    }

    if (results.invalidReadmes.length > 0) {
      recommendations.push(
        `Fix content issues in ${results.invalidReadmes.length} README files`,
      );
    }

    if (results.directoryStructure.missingDirectories.length > 0) {
      recommendations.push(
        `Create missing documentation directories: ${results.directoryStructure.missingDirectories.join(", ")}`,
      );
    }

    // Specific content recommendations
    const commonIssues = [];
    for (const invalid of results.invalidReadmes) {
      for (const issue of invalid.issues) {
        if (!commonIssues.includes(issue)) {
          commonIssues.push(issue);
        }
      }
    }

    if (commonIssues.length > 0) {
      recommendations.push(
        `Common content issues to address: ${commonIssues.slice(0, 3).join(", ")}`,
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Documentation structure is well-organized and complete",
      );
    }

    return recommendations;
  }

  /**
   * Display validation results
   */
  displayResults(results) {
    console.log("\n📊 Structure Validation Results");
    console.log("===============================\n");

    // Required README summary
    console.log("📋 Required README Files:");
    console.log(`   ✅ Valid: ${results.requiredReadmes.length}`);
    console.log(
      `   ${results.missingReadmes.length > 0 ? "❌" : "✅"} Missing: ${results.missingReadmes.length}`,
    );
    console.log(
      `   ${results.invalidReadmes.length > 0 ? "❌" : "✅"} Invalid: ${results.invalidReadmes.length}\n`,
    );

    // Missing README details
    if (results.missingReadmes.length > 0) {
      console.log("❌ Missing README Files:");
      for (const missing of results.missingReadmes) {
        console.log(
          `   • ${missing.path}${!missing.directoryExists ? " (directory does not exist)" : ""}`,
        );
      }
      console.log();
    }

    // Invalid README details
    if (results.invalidReadmes.length > 0) {
      console.log("⚠️  Invalid README Files:");
      for (const invalid of results.invalidReadmes) {
        console.log(`   • ${invalid.path}:`);
        for (const issue of invalid.issues) {
          console.log(`     - ${issue}`);
        }
      }
      console.log();
    }

    // Directory structure
    console.log("📁 Directory Structure:");
    console.log(
      `   Docs directory exists: ${results.directoryStructure.docsDirectory.exists ? "✅" : "❌"}`,
    );
    if (results.directoryStructure.missingDirectories.length > 0) {
      console.log(
        `   Missing directories: ${results.directoryStructure.missingDirectories.join(", ")}`,
      );
    }
    if (results.directoryStructure.extraDirectories.length > 0) {
      console.log(
        `   Extra directories: ${results.directoryStructure.extraDirectories.join(", ")}`,
      );
    }
    console.log();

    // Summary
    console.log(
      `📋 Summary: ${results.summary.status === "PASS" ? "✅" : results.summary.status === "WARNING" ? "⚠️" : "❌"} ${results.summary.status}\n`,
    );

    // Recommendations
    console.log("💡 Recommendations:");
    for (const rec of results.summary.recommendations) {
      console.log(`   • ${rec}`);
    }
  }

  /**
   * Export results to JSON
   */
  exportResults(results, outputPath = "structure-validation-results.json") {
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
      case "--root":
        options.rootPath = args[++i] || ".";
        break;
      case "--export":
        options.exportPath = args[++i];
        break;
      case "--help":
        console.log(`
Documentation Structure Validation Tool

Usage: node structure-validator.js [options]

Options:
  --root <path>     Root path for validation (default: .)
  --export <path>   Export results to JSON file
  --help            Show this help message

Examples:
  node structure-validator.js
  node structure-validator.js --root ./my-project
  node structure-validator.js --export structure-report.json
        `);
        return;
    }
  }

  try {
    const validator = new DocumentationStructureValidator(options);
    const results = await validator.validateStructure();

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
module.exports = DocumentationStructureValidator;

// Run if called directly
if (require.main === module) {
  main();
}
