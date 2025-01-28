import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';  
import { generateAccountData } from './utils/generate-account-data.js';

test.describe('Accessibility Checks for Login and Create Account Pages', () => {

  // Helper function to print detailed accessibility results
  async function printAccessibilityResults(results, pageName) {
    console.log(`\n=== Accessibility Results for ${pageName} ===`);
    console.log(`Violations found: ${results.violations.length}`);
    console.log(`Passes found: ${results.passes.length}`);
    console.log(`Incomplete tests: ${results.incomplete.length}`);
    console.log(`Inapplicable tests: ${results.inapplicable.length}\n`);

    if (results.violations.length > 0) {
      console.log('VIOLATIONS DETAILS:');
      results.violations.forEach((violation, index) => {
        console.log(`\nViolation ${index + 1}:`);
        console.log(`Rule: ${violation.id} - ${violation.help}`);
        console.log(`Impact: ${violation.impact}`);
        console.log(`Description: ${violation.description}`);
        console.log('Affected elements:');
        violation.nodes.forEach((node, nodeIndex) => {
          console.log(`  ${nodeIndex + 1}. ${node.html}`);
          console.log(`     Fix: ${node.failureSummary}`);
        });
      });
    }

    // Log passes if you want to see what's working well
    if (results.passes.length > 0) {
      console.log('\nPASSED CHECKS:');
      results.passes.forEach((pass, index) => {
        console.log(`${index + 1}. ${pass.id} - ${pass.description}`);
      });
    }
  }

  // Function to fill 'Create Account' form with account data and submit
  async function submitForm(page, account) {
    await page.fill('#acctEmail', account.email);
    await page.fill('#acctPassword', account.password);
    await page.fill('#acctPasswordRepeat', account.password);
    await page.fill('#acctDisplayName', account.displayName);
    await page.fill('#acctSecurityQuestion', account.securityQuestion);
    await page.fill('#acctSecurityAnswer', account.securityAnswer);
    if (account.profilePic !== "images/DefaultProfilePic.jpg") {
      await page.setInputFiles('#acctProfilePic', account.profilePic);
      await page.waitForTimeout(100); // wait for image to load
    }
    await page.click('#submitCreateAccountBtn');
  }

  // Start each test at the login page
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5500');
  });

  test('Login page should pass accessibility checks', async ({ page }) => {
    const loginResults = await new AxeBuilder({ page }).analyze();
    await printAccessibilityResults(loginResults, 'Login Page');
    expect(loginResults.violations).toEqual([]);
  });

  test('Create Account page should pass accessibility checks', async ({ page }) => {
    // Navigate to create account page
    await page.click('#createAccountBtn');
    
    const createAccountResults = await new AxeBuilder({ page }).analyze();
    await printAccessibilityResults(createAccountResults, 'Create Account Page');
    expect(createAccountResults.violations).toEqual([]);
  });

  test('Post-account creation Login page should pass accessibility checks', async ({ page }) => {
    // Navigate to create account page
    await page.click('#createAccountBtn');
    
    // Create account
    const userData = generateAccountData();
    await submitForm(page, userData);
    
    const postCreationResults = await new AxeBuilder({ page }).analyze();
    await printAccessibilityResults(postCreationResults, 'Post-Creation Page');
    expect(postCreationResults.violations).toEqual([]);
  });
});