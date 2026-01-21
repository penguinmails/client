#!/usr/bin/env node

/**
 * Main script to run complete documentation analysis
 * Usage: node scripts/run-docs-analysis.js [output-directory]
 */

const DocumentationAnalysisGenerator = require("./generate-docs-analysis");
const path = require("path");

async function main() {
  const outputDir = process.argv[2] || ".";

  console.log("🔍 Starting Documentation Analysis");
  console.log("=====================================\n");

  try {
    const generator = new DocumentationAnalysisGenerator();
    const analysis = await generator.runAnalysis(".");
    const { jsonPath, mdPath } = await generator.exportResults(
      analysis,
      outputDir,
    );

    console.log("\n✅ Analysis Complete!");
    console.log("====================");
    console.log(`📊 Found ${analysis.metadata.totalFiles} documentation files`);
    console.log(`🔗 Analyzed ${analysis.metadata.totalLinks} links`);
    console.log(
      `⚠️  Found ${analysis.linkAnalysis.brokenLinkReport.summary.brokenLinks} broken links`,
    );
    console.log(
      `📋 Generated ${analysis.recommendations.length} recommendations`,
    );
    console.log("\n📁 Output Files:");
    console.log(`   • ${jsonPath}`);
    console.log(`   • ${mdPath}`);
    console.log("\n💡 Next Steps:");
    console.log(
      "   1. Review the markdown report for detailed recommendations",
    );
    console.log("   2. Follow the action plan to reorganize documentation");
    console.log("   3. Fix broken links identified in the analysis");
  } catch (error) {
    console.error("❌ Analysis failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
