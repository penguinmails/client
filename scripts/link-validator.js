#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { URL } = require("url");

/**
 * Link validation system for markdown documentation
 * Validates both internal and external links
 */

class LinkValidator {
  constructor() {
    this.links = [];
    this.brokenLinks = [];
    this.validLinks = [];
    this.externalLinks = [];
    this.internalLinks = [];
    this.checkedExternalUrls = new Map(); // Cache for external URL checks
  }

  /**
   * Extract all links from markdown content
   */
  extractLinks(content, filePath) {
    const links = [];

    // Regex patterns for different link types
    const patterns = [
      // [text](url) format
      /\[([^\]]*)\]\(([^)]+)\)/g,
      // [text]: url format (reference links)
      /^\s*\[([^\]]+)\]:\s*(.+)$/gm,
      // <url> format
      /<(https?:\/\/[^>]+)>/g,
      // Direct URLs (basic detection)
      /(?:^|\s)(https?:\/\/[^\s]+)/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const linkText = match[1] || "";
        const linkUrl = match[2] || match[1];

        if (linkUrl && linkUrl.trim()) {
          const link = {
            text: linkText.trim(),
            url: linkUrl.trim(),
            sourceFile: filePath,
            lineNumber: this.getLineNumber(content, match.index),
            isExternal: this.isExternalLink(linkUrl.trim()),
            isValid: null, // Will be determined during validation
            error: null,
          };

          links.push(link);
        }
      }
    }

    return links;
  }

  /**
   * Get line number for a given character index in content
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split("\n").length;
  }

  /**
   * Determine if a link is external
   */
  isExternalLink(url) {
    return (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("//")
    );
  }

  /**
   * Validate internal link against file system
   */
  async validateInternalLink(link, rootPath = ".") {
    try {
      let targetPath = link.url;

      // Handle relative paths
      if (targetPath.startsWith("./") || targetPath.startsWith("../")) {
        const sourceDir = path.dirname(link.sourceFile);
        targetPath = path.resolve(rootPath, sourceDir, targetPath);
        targetPath = path.relative(rootPath, targetPath);
      } else if (targetPath.startsWith("/")) {
        targetPath = targetPath.substring(1);
      }

      // Remove anchor fragments
      const [filePath, anchor] = targetPath.split("#");

      // Check if file exists
      const fullPath = path.resolve(rootPath, filePath);

      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        if (stats.isFile()) {
          link.isValid = true;
          // TODO: Could validate anchor exists in file content
        } else {
          link.isValid = false;
          link.error = "Path exists but is not a file";
        }
      } else {
        link.isValid = false;
        link.error = "File does not exist";
      }
    } catch (error) {
      link.isValid = false;
      link.error = `Validation error: ${error.message}`;
    }
  }

  /**
   * Validate external link by making HTTP request
   */
  async validateExternalLink(link) {
    try {
      const url = link.url;

      // Check cache first
      if (this.checkedExternalUrls.has(url)) {
        const cachedResult = this.checkedExternalUrls.get(url);
        link.isValid = cachedResult.isValid;
        link.error = cachedResult.error;
        return;
      }

      const result = await this.checkUrl(url);

      // Cache result
      this.checkedExternalUrls.set(url, result);

      link.isValid = result.isValid;
      link.error = result.error;
    } catch (error) {
      link.isValid = false;
      link.error = `External link check failed: ${error.message}`;
    }
  }

  /**
   * Check if external URL is accessible
   */
  checkUrl(url) {
    return new Promise((resolve) => {
      try {
        const urlObj = new URL(url);
        const client = urlObj.protocol === "https:" ? https : http;

        const options = {
          method: "HEAD",
          timeout: 5000,
          headers: {
            "User-Agent": "Documentation Link Validator",
          },
        };

        const req = client.request(url, options, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve({ isValid: true, error: null });
          } else if (res.statusCode >= 300 && res.statusCode < 400) {
            // Handle redirects
            resolve({ isValid: true, error: `Redirect (${res.statusCode})` });
          } else {
            resolve({ isValid: false, error: `HTTP ${res.statusCode}` });
          }
        });

        req.on("timeout", () => {
          req.destroy();
          resolve({ isValid: false, error: "Request timeout" });
        });

        req.on("error", (error) => {
          resolve({ isValid: false, error: error.message });
        });

        req.end();
      } catch (error) {
        resolve({ isValid: false, error: `Invalid URL: ${error.message}` });
      }
    });
  }

  /**
   * Scan all markdown files and extract links
   */
  async scanFiles(files) {
    console.log("Extracting links from markdown files...");

    for (const file of files) {
      try {
        const content = fs.readFileSync(file.fullPath, "utf8");
        const fileLinks = this.extractLinks(content, file.path);
        this.links.push(...fileLinks);
      } catch (error) {
        console.error(`Error reading file ${file.path}:`, error.message);
      }
    }

    // Separate internal and external links
    this.internalLinks = this.links.filter((link) => !link.isExternal);
    this.externalLinks = this.links.filter((link) => link.isExternal);

    console.log(`Found ${this.links.length} total links:`);
    console.log(`  Internal: ${this.internalLinks.length}`);
    console.log(`  External: ${this.externalLinks.length}`);
  }

  /**
   * Validate all links
   */
  async validateLinks(rootPath = ".") {
    console.log("\nValidating internal links...");

    // Validate internal links
    for (const link of this.internalLinks) {
      await this.validateInternalLink(link, rootPath);
    }

    console.log("Validating external links...");

    // Validate external links (with some rate limiting)
    const batchSize = 5;
    for (let i = 0; i < this.externalLinks.length; i += batchSize) {
      const batch = this.externalLinks.slice(i, i + batchSize);
      await Promise.all(batch.map((link) => this.validateExternalLink(link)));

      // Small delay between batches to be respectful
      if (i + batchSize < this.externalLinks.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Categorize results
    this.brokenLinks = this.links.filter((link) => link.isValid === false);
    this.validLinks = this.links.filter((link) => link.isValid === true);

    console.log("\nValidation complete:");
    console.log(`  Valid links: ${this.validLinks.length}`);
    console.log(`  Broken links: ${this.brokenLinks.length}`);
  }

  /**
   * Generate broken link report
   */
  generateBrokenLinkReport() {
    const report = {
      summary: {
        totalLinks: this.links.length,
        validLinks: this.validLinks.length,
        brokenLinks: this.brokenLinks.length,
        internalLinks: this.internalLinks.length,
        externalLinks: this.externalLinks.length,
        brokenInternal: this.brokenLinks.filter((l) => !l.isExternal).length,
        brokenExternal: this.brokenLinks.filter((l) => l.isExternal).length,
      },
      brokenLinksByFile: {},
      brokenLinksByType: {
        internal: this.brokenLinks.filter((l) => !l.isExternal),
        external: this.brokenLinks.filter((l) => l.isExternal),
      },
      recommendations: [],
    };

    // Group broken links by source file
    for (const link of this.brokenLinks) {
      if (!report.brokenLinksByFile[link.sourceFile]) {
        report.brokenLinksByFile[link.sourceFile] = [];
      }
      report.brokenLinksByFile[link.sourceFile].push(link);
    }

    // Generate recommendations
    if (report.summary.brokenInternal > 0) {
      report.recommendations.push(
        "Fix broken internal links by updating file paths or creating missing files",
      );
    }
    if (report.summary.brokenExternal > 0) {
      report.recommendations.push(
        "Review external links and update or remove dead links",
      );
    }
    if (report.summary.brokenLinks > report.summary.totalLinks * 0.1) {
      report.recommendations.push(
        "High number of broken links detected - consider comprehensive link audit",
      );
    }

    return report;
  }

  /**
   * Export link validation results
   */
  exportResults(outputPath = "link-validation-results.json") {
    const results = {
      links: this.links,
      brokenLinkReport: this.generateBrokenLinkReport(),
      validationDate: new Date().toISOString(),
    };

    try {
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
      console.log(`\nLink validation results exported to ${outputPath}`);
    } catch (error) {
      console.error("Error exporting results:", error.message);
    }

    return results;
  }
}

module.exports = LinkValidator;
