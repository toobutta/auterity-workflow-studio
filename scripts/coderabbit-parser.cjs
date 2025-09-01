#!/usr/bin/env node

/**
 * CodeRabbit Issue Parser
 * Extracts and categorizes backend issues from CodeRabbit feedback
 */

const fs = require('fs');
const path = require('path');

class CodeRabbitIssueParser {
  constructor() {
    this.issuePatterns = {
      'missing-imports': {
        patterns: [
          /missing import|import.*not found|cannot find module/i,
          /module.*not found|failed to resolve import/i,
          /'.*' is not defined|'.*' is not exported/i
        ],
        severity: 'medium',
        category: 'dependencies'
      },
      'type-annotations': {
        patterns: [
          /type annotation|missing type|type.*missing/i,
          /typescript.*error|ts\(\d+\)/i,
          /parameter.*implicitly.*any|implicit.*any/i,
          /return.*type.*annotation/i
        ],
        severity: 'medium',
        category: 'types'
      },
      'code-style': {
        patterns: [
          /code style|formatting|linting/i,
          /eslint|prettier|indent/i,
          /trailing.*space|unnecessary.*semicolon/i
        ],
        severity: 'low',
        category: 'style'
      },
      'security-vulnerabilities': {
        patterns: [
          /security.*vulnerability|security.*issue/i,
          /cve-|security.*risk|potential.*exploit/i,
          /xss|injection|csrf/i,
          /unsafe.*operation|dangerous.*function/i
        ],
        severity: 'high',
        category: 'security'
      },
      'performance-issues': {
        patterns: [
          /performance.*issue|slow.*query|inefficient/i,
          /optimization.*needed|memory.*usage/i,
          /expensive.*operation|blocking.*call/i,
          /n\+1.*query|database.*performance/i
        ],
        severity: 'medium',
        category: 'performance'
      },
      'async-await': {
        patterns: [
          /async.*await|promise.*chain|callback.*hell/i,
          /unresolved.*promise|missing.*await/i,
          /promise.*not.*handled|async.*pattern/i
        ],
        severity: 'medium',
        category: 'async'
      },
      'error-handling': {
        patterns: [
          /error.*handling|try.*catch|exception.*handling/i,
          /error.*not.*handled|unhandled.*rejection/i,
          /missing.*error.*check|graceful.*error/i
        ],
        severity: 'high',
        category: 'error-handling'
      },
      'null-undefined': {
        patterns: [
          /null.*check|undefined.*check|nullable/i,
          /optional.*chaining|null.*pointer|undefined.*access/i,
          /potential.*null|may.*be.*null/i
        ],
        severity: 'medium',
        category: 'safety'
      },
      'memory-leaks': {
        patterns: [
          /memory.*leak|circular.*reference|cleanup.*needed/i,
          /event.*listener.*not.*removed|timer.*not.*cleared/i,
          /resource.*not.*freed|reference.*not.*cleared/i
        ],
        severity: 'high',
        category: 'memory'
      },
      'api-design': {
        patterns: [
          /api.*design|rest.*api|endpoint.*design/i,
          /http.*status|response.*format|request.*validation/i,
          /api.*versioning|endpoint.*naming/i
        ],
        severity: 'medium',
        category: 'api'
      }
    };
  }

  /**
   * Parse feedback text and extract issues
   * @param {string} feedbackText - The CodeRabbit feedback text
   * @returns {Array} Array of detected issues
   */
  parseIssues(feedbackText) {
    const detectedIssues = [];

    for (const [issueType, config] of Object.entries(this.issuePatterns)) {
      for (const pattern of config.patterns) {
        if (pattern.test(feedbackText)) {
          const issue = {
            type: issueType,
            severity: config.severity,
            category: config.category,
            description: this.extractDescription(feedbackText, pattern),
            suggestions: this.extractSuggestions(feedbackText, issueType),
            confidence: this.calculateConfidence(feedbackText, pattern)
          };
          
          detectedIssues.push(issue);
          break; // Only add one instance per issue type
        }
      }
    }

    return this.prioritizeIssues(detectedIssues);
  }

  /**
   * Extract description from feedback text
   * @param {string} text - Feedback text
   * @param {RegExp} pattern - Matching pattern
   * @returns {string} Extracted description
   */
  extractDescription(text, pattern) {
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (pattern.test(line)) {
        // Clean and return the matching line
        return line.trim().replace(/^\W+/, '').substring(0, 200);
      }
    }
    
    return 'Issue detected in CodeRabbit feedback';
  }

  /**
   * Extract fix suggestions for specific issue types
   * @param {string} text - Feedback text
   * @param {string} issueType - Type of issue
   * @returns {Array} Array of suggestions
   */
  extractSuggestions(text, issueType) {
    const suggestions = [];
    const lines = text.split('\n');

    // Look for common suggestion patterns
    const suggestionPatterns = [
      /suggest|recommend|should|consider/i,
      /fix|resolve|change|update/i,
      /use|replace|add|remove/i
    ];

    for (const line of lines) {
      for (const pattern of suggestionPatterns) {
        if (pattern.test(line) && line.length > 10 && line.length < 300) {
          suggestions.push(line.trim());
          break;
        }
      }
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Calculate confidence score for issue detection
   * @param {string} text - Feedback text
   * @param {RegExp} pattern - Matching pattern
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(text, pattern) {
    let confidence = 0.5; // Base confidence

    // Increase confidence for multiple matches
    const matches = text.match(new RegExp(pattern.source, 'gi'));
    if (matches) {
      confidence += Math.min(matches.length * 0.1, 0.3);
    }

    // Increase confidence for code-specific keywords
    const codeKeywords = ['function', 'class', 'const', 'let', 'var', 'async', 'await'];
    for (const keyword of codeKeywords) {
      if (text.includes(keyword)) {
        confidence += 0.05;
      }
    }

    // Increase confidence for file references
    if (text.match(/\.(ts|tsx|js|jsx|py|java|cs)/)) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Prioritize issues by severity and confidence
   * @param {Array} issues - Array of detected issues
   * @returns {Array} Prioritized issues
   */
  prioritizeIssues(issues) {
    const severityWeights = {
      'high': 3,
      'medium': 2,
      'low': 1
    };

    return issues.sort((a, b) => {
      const scoreA = severityWeights[a.severity] * a.confidence;
      const scoreB = severityWeights[b.severity] * b.confidence;
      return scoreB - scoreA;
    });
  }

  /**
   * Generate summary report of detected issues
   * @param {Array} issues - Array of detected issues
   * @returns {Object} Summary report
   */
  generateSummary(issues) {
    const summary = {
      totalIssues: issues.length,
      bySeverity: { high: 0, medium: 0, low: 0 },
      byCategory: {},
      recommendations: []
    };

    for (const issue of issues) {
      summary.bySeverity[issue.severity]++;
      
      if (!summary.byCategory[issue.category]) {
        summary.byCategory[issue.category] = 0;
      }
      summary.byCategory[issue.category]++;

      if (issue.suggestions.length > 0) {
        summary.recommendations.push(...issue.suggestions);
      }
    }

    return summary;
  }
}

// Main execution
if (require.main === module) {
  const parser = new CodeRabbitIssueParser();
  
  // Get feedback from environment or command line
  const feedbackText = process.env.CODERABBIT_FEEDBACK || process.argv[2] || '';
  
  if (!feedbackText) {
    console.error('Error: No feedback text provided');
    process.exit(1);
  }

  try {
    const issues = parser.parseIssues(feedbackText);
    const summary = parser.generateSummary(issues);

    // Output results
    console.log(JSON.stringify({
      issues,
      summary,
      hasBackendIssues: issues.length > 0,
      priorityIssues: issues.filter(i => i.severity === 'high')
    }, null, 2));

  } catch (error) {
    console.error('Error parsing issues:', error.message);
    process.exit(1);
  }
}

module.exports = CodeRabbitIssueParser;