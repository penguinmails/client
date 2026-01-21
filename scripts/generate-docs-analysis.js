#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const DocumentationAuditor = require("./docs-audit");
const LinkValidator = require("./link-validator");

/**
 * Generate comprehensive documentation analysis report
 * Combines audit results with link validation and provides actionable recommendations
 */

class DocumentationAnalysisGenerator {
  constructor() {
    this.auditor = new DocumentationAuditor();
    this.linkValidator = new LinkValidator();
  }

  /**
   * Run complete analysis
   */
  async runAnalysis(rootPath = ".") {
    console.log("Starting comprehensive documentation analysis...\n");

    // Run documentation audit
    const auditResults = this.auditor.audit(rootPath);

    // Run link validation
    await this.linkValidator.scanFiles(auditResults.files);
    await this.linkValidator.validateLinks(rootPath);

    // Generate combined analysis
    const analysis = this.generateAnalysis(auditResults, this.linkValidator);

    return analysis;
  }

  /**
   * Generate comprehensive analysis combining audit and link validation
   */
  generateAnalysis(auditResults, linkValidator) {
    const analysis = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalFiles: auditResults.stats.totalFiles,
        totalSize: auditResults.stats.totalSize,
        totalLinks: linkValidator.links.length,
      },
      fileAnalysis: auditResults,
      linkAnalysis: {
        links: linkValidator.links,
        brokenLinkReport: linkValidator.generateBrokenLinkReport(),
      },
      recommendations: this.generateRecommendations(
        auditResults,
        linkValidator,
      ),
      actionPlan: this.generateActionPlan(auditResults, linkValidator),
    };

    return analysis;
  }

  /**
   * Generate actionable recommendations based on analysis
   */
  generateRecommendations(auditResults, linkValidator) {
    const recommendations = [];
    const stats = auditResults.stats;
    const brokenReport = linkValidator.generateBrokenLinkReport();

    // Migration file recommendations
    if (stats.categoryCounts.migration > 0) {
      recommendations.push({
        priority: "high",
        category: "organization",
        title: "Archive Migration Documentation",
        description: `Found ${stats.categoryCounts.migration} migration-related files that should be moved to archive`,
        files: auditResults.categories.migration.map((f) => f.path),
        action: "Move to docs/archive/migration/ directory",
      });
    }

    // Broken link recommendations
    if (brokenReport.summary.brokenLinks > 0) {
      recommendations.push({
        priority: "high",
        category: "links",
        title: "Fix Broken Links",
        description: `Found ${brokenReport.summary.brokenLinks} broken links across documentation`,
        details: {
          internal: brokenReport.summary.brokenInternal,
          external: brokenReport.summary.brokenExternal,
        },
        action: "Review and fix broken links, update file paths",
      });
    }

    // Component documentation recommendations
    if (stats.categoryCounts.component > 0) {
      recommendations.push({
        priority: "medium",
        category: "organization",
        title: "Organize Component Documentation",
        description: `Found ${stats.categoryCounts.component} component-related files that may need reorganization`,
        files: auditResults.categories.component.map((f) => f.path),
        action:
          "Evaluate if component docs should be centralized or remain co-located",
      });
    }

    // Performance documentation recommendations
    if (stats.categoryCounts.performance > 0) {
      recommendations.push({
        priority: "medium",
        category: "organization",
        title: "Consolidate Performance Documentation",
        description: `Found ${stats.categoryCounts.performance} performance-related files`,
        files: auditResults.categories.performance.map((f) => f.path),
        action: "Move to docs/performance/ directory",
      });
    }

    // Files without titles
    if (stats.filesWithoutTitles > 0) {
      recommendations.push({
        priority: "low",
        category: "quality",
        title: "Add Missing Titles",
        description: `${stats.filesWithoutTitles} files are missing proper titles (# heading)`,
        action: "Add descriptive titles to improve navigation and SEO",
      });
    }

    // Directory structure recommendations
    const rootFiles = auditResults.files.filter((f) => f.directory === ".");
    if (rootFiles.length > 5) {
      recommendations.push({
        priority: "medium",
        category: "organization",
        title: "Organize Root Directory Files",
        description: `${rootFiles.length} markdown files in root directory`,
        files: rootFiles.map((f) => f.path),
        action: "Move files to appropriate subdirectories",
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate step-by-step action plan
   */
  generateActionPlan(auditResults, linkValidator) {
    const plan = {
      phases: [
        {
          name: "Archive and Cleanup",
          priority: 1,
          tasks: [],
          estimatedEffort: "Low",
        },
        {
          name: "Link Repair",
          priority: 2,
          tasks: [],
          estimatedEffort: "Medium",
        },
        {
          name: "Organization and Structure",
          priority: 3,
          tasks: [],
          estimatedEffort: "Medium",
        },
        {
          name: "Quality Improvements",
          priority: 4,
          tasks: [],
          estimatedEffort: "Low",
        },
      ],
    };

    // Phase 1: Archive and Cleanup
    if (auditResults.stats.categoryCounts.migration > 0) {
      plan.phases[0].tasks.push({
        task: "Create archive directory structure",
        description:
          "Create docs/archive/migration/ and docs/archive/temporary/",
        files: [],
      });
      plan.phases[0].tasks.push({
        task: "Move migration documents",
        description: `Move ${auditResults.stats.categoryCounts.migration} migration files to archive`,
        files: auditResults.categories.migration.map((f) => f.path),
      });
    }

    // Phase 2: Link Repair
    const brokenReport = linkValidator.generateBrokenLinkReport();
    if (brokenReport.summary.brokenInternal > 0) {
      plan.phases[1].tasks.push({
        task: "Fix internal broken links",
        description: `Repair ${brokenReport.summary.brokenInternal} broken internal links`,
        files: Object.keys(brokenReport.brokenLinksByFile),
      });
    }
    if (brokenReport.summary.brokenExternal > 0) {
      plan.phases[1].tasks.push({
        task: "Review external links",
        description: `Check and update ${brokenReport.summary.brokenExternal} broken external links`,
        files: [],
      });
    }

    // Phase 3: Organization
    if (auditResults.stats.categoryCounts.component > 0) {
      plan.phases[2].tasks.push({
        task: "Organize component documentation",
        description: "Decide on centralization vs co-location strategy",
        files: auditResults.categories.component.map((f) => f.path),
      });
    }
    if (auditResults.stats.categoryCounts.performance > 0) {
      plan.phases[2].tasks.push({
        task: "Create performance documentation section",
        description: "Move performance files to docs/performance/",
        files: auditResults.categories.performance.map((f) => f.path),
      });
    }

    // Phase 4: Quality
    if (auditResults.stats.filesWithoutTitles > 0) {
      plan.phases[3].tasks.push({
        task: "Add missing titles",
        description: `Add titles to ${auditResults.stats.filesWithoutTitles} files`,
        files: auditResults.files.filter((f) => !f.hasTitle).map((f) => f.path),
      });
    }

    return plan;
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(analysis) {
    const report = [];

    report.push("# Documentation Analysis Report");
    report.push("");
    report.push(
      `Generated: ${new Date(analysis.metadata.generatedAt).toLocaleString()}`,
    );
    report.push("");

    // Executive Summary
    report.push("## Executive Summary");
    report.push("");
    report.push(`- **Total Files**: ${analysis.metadata.totalFiles}`);
    report.push(
      `- **Total Size**: ${(analysis.metadata.totalSize / 1024).toFixed(1)} KB`,
    );
    report.push(`- **Total Links**: ${analysis.metadata.totalLinks}`);
    report.push(
      `- **Broken Links**: ${analysis.linkAnalysis.brokenLinkReport.summary.brokenLinks}`,
    );
    report.push(
      `- **High Priority Issues**: ${analysis.recommendations.filter((r) => r.priority === "high").length}`,
    );
    report.push("");

    // File Categories
    report.push("## File Categories");
    report.push("");
    const stats = analysis.fileAnalysis.stats;
    for (const [category, count] of Object.entries(stats.categoryCounts)) {
      if (count > 0) {
        report.push(
          `- **${category.charAt(0).toUpperCase() + category.slice(1)}**: ${count} files`,
        );
      }
    }
    report.push("");

    // Directory Distribution
    report.push("## Directory Distribution");
    report.push("");
    for (const [dir, count] of Object.entries(stats.directoryCounts)) {
      report.push(`- **${dir}**: ${count} files`);
    }
    report.push("");

    // Recommendations
    report.push("## Recommendations");
    report.push("");
    for (const rec of analysis.recommendations) {
      report.push(`### ${rec.title} (${rec.priority.toUpperCase()} Priority)`);
      report.push("");
      report.push(rec.description);
      report.push("");
      report.push(`**Action**: ${rec.action}`);
      report.push("");
      if (rec.files && rec.files.length > 0) {
        report.push("**Affected Files**:");
        for (const file of rec.files.slice(0, 10)) {
          // Limit to first 10
          report.push(`- ${file}`);
        }
        if (rec.files.length > 10) {
          report.push(`- ... and ${rec.files.length - 10} more`);
        }
        report.push("");
      }
    }

    // Action Plan
    report.push("## Action Plan");
    report.push("");
    for (const phase of analysis.actionPlan.phases) {
      if (phase.tasks.length > 0) {
        report.push(`### Phase ${phase.priority}: ${phase.name}`);
        report.push("");
        report.push(`**Estimated Effort**: ${phase.estimatedEffort}`);
        report.push("");
        for (const task of phase.tasks) {
          report.push(`- **${task.task}**: ${task.description}`);
        }
        report.push("");
      }
    }

    // Broken Links Detail
    if (analysis.linkAnalysis.brokenLinkReport.summary.brokenLinks > 0) {
      report.push("## Broken Links Detail");
      report.push("");

      const brokenByFile =
        analysis.linkAnalysis.brokenLinkReport.brokenLinksByFile;
      for (const [file, links] of Object.entries(brokenByFile)) {
        report.push(`### ${file}`);
        report.push("");
        for (const link of links) {
          report.push(`- Line ${link.lineNumber}: [${link.text}](${link.url})`);
          report.push(`  - Error: ${link.error}`);
        }
        report.push("");
      }
    }

    return report.join("\n");
  }

  /**
   * Export analysis results
   */
  async exportResults(analysis, outputDir = ".") {
    // Export JSON results
    const jsonPath = path.join(outputDir, "docs-analysis-results.json");
    fs.writeFileSync(jsonPath, JSON.stringify(analysis, null, 2));

    // Export markdown report
    const markdownReport = this.generateMarkdownReport(analysis);
    const mdPath = path.join(outputDir, "docs-analysis-report.md");
    fs.writeFileSync(mdPath, markdownReport);

    console.log(`\nAnalysis complete!`);
    console.log(`- JSON results: ${jsonPath}`);
    console.log(`- Markdown report: ${mdPath}`);

    return { jsonPath, mdPath };
  }
}

// Run analysis if script is executed directly
if (require.main === module) {
  const generator = new DocumentationAnalysisGenerator();
  generator
    .runAnalysis()
    .then((analysis) => generator.exportResults(analysis))
    .catch((error) => {
      console.error("Analysis failed:", error);
      process.exit(1);
    });
}

module.exports = DocumentationAnalysisGenerator;
