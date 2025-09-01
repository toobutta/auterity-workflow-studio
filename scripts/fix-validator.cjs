#!/usr/bin/env node

/**
 * CodeRabbit Fix Validator
 * Validates that automated fixes don't break the codebase
 */

const { execSync } = require('child_process');
const fs = require('fs');

class FixValidator {
  constructor() {
    this.validationResults = {
      build: false,
      tests: false,
      lint: false,
      typescript: false,
      errors: []
    };
  }

  /**
   * Run full validation suite
   * @returns {Object} Validation results
   */
  async runValidation() {
    console.log('🔍 Running fix validation suite...');
    
    try {
      await this.validateBuild();
      await this.validateTests();
      await this.validateLinting();
      await this.validateTypeScript();
      
      const success = this.validationResults.build && 
                     this.validationResults.tests && 
                     this.validationResults.lint && 
                     this.validationResults.typescript;
      
      console.log(success ? '✅ All validations passed!' : '❌ Some validations failed');
      return { success, results: this.validationResults };
      
    } catch (error) {
      console.error('💥 Validation suite failed:', error.message);
      this.validationResults.errors.push(error.message);
      return { success: false, results: this.validationResults };
    }
  }

  /**
   * Validate build process
   */
  async validateBuild() {
    console.log('⚙️ Validating build...');
    try {
      const result = execSync('npm run build', { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 120000 // 2 minute timeout
      });
      
      this.validationResults.build = true;
      console.log('✅ Build successful');
      
    } catch (error) {
      this.validationResults.build = false;
      this.validationResults.errors.push(`Build failed: ${error.message}`);
      console.log('❌ Build failed');
    }
  }

  /**
   * Validate test suite
   */
  async validateTests() {
    console.log('🧪 Validating tests...');
    try {
      // Try different test commands
      const testCommands = [
        'npm test -- --run',
        'npm run test',
        'npx vitest --run',
        'npx jest --passWithNoTests'
      ];
      
      let testsPassed = false;
      for (const command of testCommands) {
        try {
          execSync(command, { 
            encoding: 'utf8', 
            stdio: 'pipe',
            timeout: 180000 // 3 minute timeout
          });
          testsPassed = true;
          break;
        } catch (error) {
          continue; // Try next command
        }
      }
      
      this.validationResults.tests = testsPassed;
      console.log(testsPassed ? '✅ Tests passed' : '⚠️ Tests not available or failed');
      
    } catch (error) {
      this.validationResults.tests = false;
      this.validationResults.errors.push(`Tests failed: ${error.message}`);
      console.log('❌ Tests failed');
    }
  }

  /**
   * Validate linting
   */
  async validateLinting() {
    console.log('🧹 Validating linting...');
    try {
      // Check if ESLint config exists
      const eslintConfigs = ['.eslintrc.js', '.eslintrc.json', 'eslint.config.js', '.eslintrc.cjs'];
      const hasESLint = eslintConfigs.some(config => fs.existsSync(config));
      
      if (hasESLint) {
        execSync('npx eslint src --ext .ts,.tsx,.js,.jsx', { 
          encoding: 'utf8', 
          stdio: 'pipe',
          timeout: 60000 // 1 minute timeout
        });
      }
      
      // Check if Prettier config exists
      const prettierConfigs = ['.prettierrc', '.prettierrc.json', 'prettier.config.js'];
      const hasPrettier = prettierConfigs.some(config => fs.existsSync(config));
      
      if (hasPrettier) {
        execSync('npx prettier --check "src/**/*.{ts,tsx,js,jsx}"', { 
          encoding: 'utf8', 
          stdio: 'pipe',
          timeout: 60000
        });
      }
      
      this.validationResults.lint = true;
      console.log('✅ Linting passed');
      
    } catch (error) {
      this.validationResults.lint = false;
      this.validationResults.errors.push(`Linting failed: ${error.message}`);
      console.log('❌ Linting failed');
    }
  }

  /**
   * Validate TypeScript compilation
   */
  async validateTypeScript() {
    console.log('🔷 Validating TypeScript...');
    try {
      // Check if TypeScript is configured
      if (fs.existsSync('tsconfig.json')) {
        execSync('npx tsc --noEmit --skipLibCheck', { 
          encoding: 'utf8', 
          stdio: 'pipe',
          timeout: 90000 // 1.5 minute timeout
        });
        
        this.validationResults.typescript = true;
        console.log('✅ TypeScript compilation successful');
      } else {
        this.validationResults.typescript = true; // Skip if no TS config
        console.log('⚠️ No TypeScript configuration found, skipping');
      }
      
    } catch (error) {
      this.validationResults.typescript = false;
      this.validationResults.errors.push(`TypeScript compilation failed: ${error.message}`);
      console.log('❌ TypeScript compilation failed');
    }
  }

  /**
   * Generate validation report
   * @param {Object} results - Validation results
   * @returns {string} Formatted report
   */
  generateReport(results) {
    const { success, results: validationResults } = results;
    
    let report = '## 🔍 Fix Validation Report\n\n';
    
    if (success) {
      report += '✅ **All validations passed successfully!**\n\n';
    } else {
      report += '❌ **Some validations failed**\n\n';
    }
    
    report += '### Validation Results\n\n';
    report += `- **Build**: ${validationResults.build ? '✅ Success' : '❌ Failed'}\n`;
    report += `- **Tests**: ${validationResults.tests ? '✅ Pass' : '❌ Fail'}\n`;
    report += `- **Linting**: ${validationResults.lint ? '✅ Pass' : '❌ Fail'}\n`;
    report += `- **TypeScript**: ${validationResults.typescript ? '✅ Pass' : '❌ Fail'}\n\n`;
    
    if (validationResults.errors.length > 0) {
      report += '### Errors\n\n';
      validationResults.errors.forEach(error => {
        report += `- ${error}\n`;
      });
      report += '\n';
    }
    
    if (!success) {
      report += '### Recommendations\n\n';
      report += '1. Review the error messages above\n';
      report += '2. Check if the automated fixes caused any breaking changes\n';
      report += '3. Consider reverting problematic changes\n';
      report += '4. Manual intervention may be required\n\n';
    }
    
    report += '---\n';
    report += '*This report was generated by the CodeRabbit Fix Validator*';
    
    return report;
  }
}

// Main execution
if (require.main === module) {
  const validator = new FixValidator();
  
  validator.runValidation().then(results => {
    console.log('\n📊 Final Results:');
    console.log(JSON.stringify(results, null, 2));
    
    // Write results for GitHub Actions
    fs.writeFileSync('validation_results.json', JSON.stringify(results, null, 2));
    
    // Generate report
    const report = validator.generateReport(results);
    fs.writeFileSync('validation_report.md', report);
    
    // Set GitHub Actions outputs
    console.log(`::set-output name=validation_success::${results.success}`);
    console.log(`::set-output name=build_success::${results.results.build}`);
    console.log(`::set-output name=tests_pass::${results.results.tests}`);
    console.log(`::set-output name=lint_pass::${results.results.lint}`);
    console.log(`::set-output name=typescript_pass::${results.results.typescript}`);
    
    process.exit(results.success ? 0 : 1);
  }).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = FixValidator;