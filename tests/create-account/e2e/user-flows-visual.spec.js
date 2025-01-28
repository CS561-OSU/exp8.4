
import { test, expect } from '@playwright/test'
import { generateAccountData } from './utils/generate-account-data.js';
import path from 'path';
import fs from 'fs';

test.describe('Create Account User Flows (Visual UI)', () => {

  //Function to fill 'Create Account' form with account data and submit
  async function submitForm(page, account) {
    if (account.profilePic !== "images/DefaultProfilePic.jpg") {
      await page.setInputFiles('#acctProfilePic', account.profilePic);
      await page.waitForTimeout(100); // wait for image to load
    }
    await page.fill('#acctEmail', account.email);
    await page.fill('#acctPassword', account.password);
    await page.fill('#acctPasswordRepeat', account.password);
    await page.fill('#acctDisplayName', account.displayName);
    await page.fill('#acctSecurityQuestion', account.securityQuestion);
    await page.fill('#acctSecurityAnswer', account.securityAnswer);
    await page.click('#submitCreateAccountBtn');
  }

  //Function to retrieve stored account from local storage
  async function getStoredAccount(page, email) {
    const storedAccount = await page.evaluate((email) => {
      return localStorage.getItem(email);
    }, email);
    return JSON.parse(storedAccount);
  }

  async function getDataUrl(filePath) {
    const imagePath = path.resolve(filePath);
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    return `data:image/jpeg;base64,${imageBase64}`;
  }


  //Start each test at "Create Account" page
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5500');
    await page.click('#createAccountBtn');
  });

  test.afterEach(async ({ page }) => {
    // Clear local storage after each test
    await page.evaluate(() => localStorage.clear());
    // Clean up unique profile picture files
  });

  test('should create new account with valid data and default profile pic', async ({ page }) => {
    const userData = generateAccountData();
    await submitForm(page, userData);  
    await expect(page.locator('#loginPage')).toBeVisible();
    await expect(page.locator('#accountCreated')).toBeVisible();
    await expect(page.locator('#accountCreatedEmail')).toHaveText(userData.email);
    const storedAccount = await getStoredAccount(page, userData.email);
    expect(storedAccount).not.toBeNull();
    expect(storedAccount.accountInfo.email).toBe(userData.email);
    expect(storedAccount.accountInfo.password).toBe(userData.password); 
    expect(storedAccount.accountInfo.securityQuestion).toBe(userData.securityQuestion); 
    expect(storedAccount.accountInfo.securityAnswer).toBe(userData.securityAnswer); 
    expect(storedAccount.identityInfo.displayName).toBe(userData.displayName);
    expect(storedAccount.identityInfo.profilePic).toBe("images/DefaultProfilePic.jpg");
  });

  test('should create new account with valid data and custom profile pic', async ({ page }) => {
    const userData = generateAccountData({ profilePic: path.join(__dirname, 'images/valid-profile.jpg') });
    await submitForm(page, userData);
    await expect(page.locator('#loginPage')).toBeVisible();
    await expect(page.locator('#accountCreated')).toBeVisible();
    await expect(page.locator('#accountCreatedEmail')).toHaveText(userData.email);
    const storedAccount = await getStoredAccount(page, userData.email);
    expect(storedAccount).not.toBeNull();
    expect(storedAccount.accountInfo.email).toBe(userData.email);
    expect(storedAccount.accountInfo.password).toBe(userData.password); 
    expect(storedAccount.accountInfo.securityQuestion).toBe(userData.securityQuestion); 
    expect(storedAccount.accountInfo.securityAnswer).toBe(userData.securityAnswer); 
    expect(storedAccount.identityInfo.displayName).toBe(userData.displayName);
    const expectedDataURL = await getDataUrl(userData.profilePic);
    expect(storedAccount.identityInfo.profilePic).toBe(expectedDataURL);
  });

  test('should not create new account and show duplicate account error', async ({ page }) => {
    const userData = generateAccountData();
    await submitForm(page, userData);
    await expect(page.locator('#loginPage')).toBeVisible();
    await expect(page.locator('#accountCreated')).toBeVisible();
    await expect(page.locator('#accountCreatedEmail')).toHaveText(userData.email);
    await page.click('#createAccountBtn'); //go back and attempt to create account with same data
    await submitForm(page, userData);
    await expect(page.locator('#accountExistsError')).toBeVisible();
  });

  test('should not create account and show error with invalid email', async ({ page }) => {
    const userData = generateAccountData({ email: 'invalid-email' });
    await submitForm(page, userData);
    await expect(page.locator('#acctEmailError')).toBeVisible();
  });

  test('should not create account and show error with invalid password', async ({ page }) => {
    const userData = generateAccountData({ password: '123' });
    await submitForm(page, userData);
    await expect(page.locator('#acctPasswordError')).toBeVisible();
  });

  test('should not create account and show error with invalid display name', async ({ page }) => {
    const userData = generateAccountData({ displayName: '' });
    await submitForm(page, userData);
    await expect(page.locator('#acctDisplayNameError')).toBeVisible();
  });

  test('should not create account and show error with invalid security question', async ({ page }) => {
    const userData = generateAccountData({ securityQuestion: '' });
    await submitForm(page, userData);
    await expect(page.locator('#acctSecurityQuestionError')).toBeVisible();
  });

  test('should not create account and show error with invalid security answer', async ({ page }) => {
    const userData = generateAccountData({ securityAnswer: '' });
    await submitForm(page, userData);
    await expect(page.locator('#acctSecurityAnswerError')).toBeVisible();
  });

  test('should not create account and show error with invalid profile pic', async ({ page }) => {
    const userData = generateAccountData({ profilePic: path.join(__dirname, 'images/invalid-profile.docx') });
    await submitForm(page, userData);
    await expect(page.locator('#acctProfilePicError')).toBeVisible();
  });



});