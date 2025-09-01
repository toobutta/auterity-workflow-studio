#!/usr/bin/env node

/**
 * Backend Code Analyzer
 * Analyzes backend code for common issues and generates automated fixes
 */

const fs = require('fs');
const path = require('path');

class BackendCodeAnalyzer {
  constructor() {
    this.fixRules = {
      'type-annotations': [
        {
          pattern: /: any\b/g,
          replacement: ': unknown',
          description: 'Replace any type with unknown for better type safety'
        },
        {
          pattern: /function\s+(\w+)\s*\(([^)]*)\)\s*{/g,
          replacement: 'function $1($2): void {',
          description: 'Add return type annotation to function'
        },
        {
          pattern: /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*{/g,
          replacement: 'const $1 = ($2): void => {',
          description: 'Add return type annotation to arrow function'
        }
      ],
      'error-handling': [
        {
          pattern: /(async\s+function\s+\w+[^{]*{)([\s\S]*?)(}\s*$)/gm,
          replacement: '$1\n  try {\n$2\n  } catch (error) {\n    console.error("Error:", error);\n    throw error;\n  }\n$3',
          description: 'Wrap async function with try-catch block'
        },
        {
          pattern: /(await\s+[^;]+;)/g,
          replacement: 'try {\n    $1\n  } catch (error) {\n    console.error("Async operation failed:", error);\n    throw error;\n  }',
          description: 'Add error handling for await operations'
        }
      ],
      'null-undefined': [
        {
          pattern: /(\w+)\.(\w+)(?!\?\.)/g,
          replacement: '$1?.$2',
          description: 'Use optional chaining for safer property access'
        },
        {
          pattern: /if\s*\(\s*(\w+)\s*\)\s*{/g,
          replacement: 'if ($1 != null) {',
          description: 'Add explicit null check'
        }
      ],
      'missing-imports': [
        {
          pattern: /^(?!.*import.*React).*React\./m,
          replacement: "import React from 'react';\n$&",
          description: 'Add missing React import'
        },
        {
          pattern: /^(?!.*import.*useState).*useState\(/m,
          replacement: "import { useState } from 'react';\n$&",
          description: 'Add missing useState import'
        }
      ],
      'performance-optimizations': [
        {
          pattern: /document\.querySelector\(['"`]([^'"`]+)['"`]\)/g,
          replacement: 'document.getElementById("$1") || document.querySelector("$1")',
          description: 'Use getElementById for better performance when possible'
        },
        {
          pattern: /JSON\.parse\(JSON\.stringify\(([^)]+)\)\)/g,
          replacement: 'structuredClone($1)',
          description: 'Use structuredClone instead of JSON parse/stringify'
        }
      ],
      'security-fixes': [
        {
          pattern: /innerHTML\s*=\s*([^;]+);/g,
          replacement: 'textContent = $1; // Using textContent instead of innerHTML for security',
          description: 'Replace innerHTML with textContent for XSS prevention'
        },
        {
          pattern: /eval\s*\(/g,
          replacement: '// eval() removed for security - ',
          description: 'Remove dangerous eval() usage'
        }
      ]
    };

    this.analysisRules = {
      'missing-imports': [
        {
          check: (content) => content.includes('React') && !content.includes("import React"),
          message: 'Missing React import statement',
          severity: 'medium'
        },
        {
          check: (content) => content.includes('useState') && !content.includes("import { useState }"),
          message: 'Missing useState import statement',
          severity: 'medium'
        }
      ],
      'type-annotations': [
        {
          check: (content) => content.includes(': any') && !content.includes('// @ts-ignore'),
          message: 'Found usage of "any" type which should be avoided',
          severity: 'medium'
        },
        {
          check: (content) => /function\s+\w+\([^)]*\)\s*{/.test(content) && content.includes('.ts'),
          message: 'Function missing return type annotation',
          severity: 'low'
        }
      ],
      'error-handling': [
        {
          check: (content) => content.includes('async') && !content.includes('try') && !content.includes('catch'),
          message: 'Async function without error handling',
          severity: 'high'
        },
        {
          check: (content) => content.includes('await') && !content.includes('catch'),
          message: 'Await operation without error handling',
          severity: 'medium'
        }
      ],
      'null-undefined': [
        {
          check: (content) => /\w+\.\w+/.test(content) && !content.includes('?.') && !content.includes('&&'),
          message: 'Potential null/undefined access without checks',
          severity: 'medium'
        }
      ],
      'security-vulnerabilities': [
        {
          check: (content) => content.includes('innerHTML'),
          message: 'Using innerHTML which can lead to XSS vulnerabilities',
          severity: 'high'
        },
        {
          check: (content) => content.includes('eval('),
          message: 'Using eval() which is dangerous and should be avoided',
          severity: 'high'
        }
      ],
      'performance-issues': [
        {
          check: (content) => content.includes('document.querySelector') && /for|while|forEach/.test(content),
          message: 'DOM queries in loops detected - performance concern',
          severity: 'medium'
        },
        {
          check: (content) => content.includes('JSON.parse') && content.includes('JSON.stringify'),
          message: 'Potential unnecessary JSON serialization',
          severity: 'low'
        }
      ]
    };
  }

  /**
   * Analyze a file for backend issues
   * @param {string} filePath - Path to the file to analyze
   * @returns {Array} Array of detected issues
   */
  analyzeFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    // Run analysis rules
    for (const [issueType, rules] of Object.entries(this.analysisRules)) {
      for (const rule of rules) {
        if (rule.check(content)) {
          issues.push({
            type: issueType,
            message: rule.message,
            severity: rule.severity,
            file: filePath,
            fixable: this.fixRules[issueType] ? true : false
          });
        }
      }
    }

    return issues;
  }

  /**
   * Apply automated fixes to a file
   * @param {string} filePath - Path to the file to fix
   * @param {Array} issueTypes - Types of issues to fix
   * @returns {Object} Fix results
   */
  applyFixes(filePath, issueTypes = []) {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File not found' };
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const appliedFixes = [];

    // Apply fixes for specified issue types
    for (const issueType of issueTypes) {
      if (!this.fixRules[issueType]) continue;

      for (const fix of this.fixRules[issueType]) {
        const before = content;
        content = content.replace(fix.pattern, fix.replacement);
        
        if (content !== before) {
          appliedFixes.push({
            type: issueType,
            description: fix.description,
            pattern: fix.pattern.toString()
          });
        }
      }
    }

    // Write back the fixed content
    if (content !== originalContent) {
      try {
        fs.writeFileSync(filePath, content);
        return {
          success: true,
          appliedFixes,
          changesCount: appliedFixes.length
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }

    return {
      success: true,
      appliedFixes: [],
      changesCount: 0
    };
  }

  /**
   * Find all backend files in a directory
   * @param {string} dir - Directory to search
   * @param {Array} extensions - File extensions to include
   * @returns {Array} Array of file paths
   */
  findBackendFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const files = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...this.findBackendFiles(fullPath, extensions));
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Analyze entire codebase
   * @param {string} baseDir - Base directory to analyze
   * @returns {Object} Analysis results
   */
  analyzeCodebase(baseDir) {
    const files = this.findBackendFiles(baseDir);
    const allIssues = [];
    const fileAnalysis = {};

    for (const file of files) {
      const issues = this.analyzeFile(file);
      allIssues.push(...issues);
      fileAnalysis[file] = issues;
    }

    return {
      totalFiles: files.length,
      totalIssues: allIssues.length,
      issuesByType: this.groupIssuesByType(allIssues),
      issuesBySeverity: this.groupIssuesBySeverity(allIssues),
      fileAnalysis,
      fixableIssues: allIssues.filter(issue => issue.fixable).length
    };
  }

  /**
   * Group issues by type
   * @param {Array} issues - Array of issues
   * @returns {Object} Issues grouped by type
   */
  groupIssuesByType(issues) {
    const grouped = {};
    for (const issue of issues) {
      if (!grouped[issue.type]) {
        grouped[issue.type] = [];
      }
      grouped[issue.type].push(issue);
    }
    return grouped;
  }

  /**
   * Group issues by severity
   * @param {Array} issues - Array of issues
   * @returns {Object} Issues grouped by severity
   */
  groupIssuesBySeverity(issues) {
    const grouped = { high: [], medium: [], low: [] };
    for (const issue of issues) {
      if (grouped[issue.severity]) {
        grouped[issue.severity].push(issue);
      }
    }
    return grouped;
  }

  /**
   * Generate fix report
   * @param {Array} fixResults - Results from applying fixes
   * @returns {Object} Fix report
   */
  generateFixReport(fixResults) {
    const report = {
      totalFiles: fixResults.length,
      successfulFixes: fixResults.filter(r => r.success).length,
      failedFixes: fixResults.filter(r => !r.success).length,
      totalChanges: fixResults.reduce((sum, r) => sum + (r.changesCount || 0), 0),
      fixesByType: {}
    };

    for (const result of fixResults) {
      if (result.success && result.appliedFixes) {
        for (const fix of result.appliedFixes) {
          if (!report.fixesByType[fix.type]) {
            report.fixesByType[fix.type] = 0;
          }
          report.fixesByType[fix.type]++;
        }
      }
    }

    return report;
  }
}

// Main execution
if (require.main === module) {
  const analyzer = new BackendCodeAnalyzer();
  const baseDir = process.argv[2] || './src';
  const mode = process.argv[3] || 'analyze';

  try {
    if (mode === 'analyze') {
      const results = analyzer.analyzeCodebase(baseDir);
      console.log(JSON.stringify(results, null, 2));
    } else if (mode === 'fix') {
      // Analyze first to get issues
      const analysis = analyzer.analyzeCodebase(baseDir);
      const fixResults = [];

      // Apply fixes to each file with issues
      for (const [filePath, issues] of Object.entries(analysis.fileAnalysis)) {
        if (issues.length > 0) {
          const issueTypes = [...new Set(issues.map(i => i.type))];
          const result = analyzer.applyFixes(filePath, issueTypes);
          result.file = filePath;
          fixResults.push(result);
        }
      }

      const report = analyzer.generateFixReport(fixResults);
      console.log(JSON.stringify(report, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = BackendCodeAnalyzer;