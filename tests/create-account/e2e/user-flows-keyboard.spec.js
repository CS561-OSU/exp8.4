
import { test, expect } from '@playwright/test'
import { generateAccountData } from './utils/generate-account-data.js';
import path from 'path';
import fs from 'fs';
const kbTimeout = 0;

test.describe('Create Account User Flows (Keyboard UI)', () => {

  //Helper function to enter account data into 'Create Account' form
  //via keyboard and submit
  async function submitForm(page, account) {
    if (account.profilePic !== "images/DefaultProfilePic.jpg") {
      await page.setInputFiles('#acctProfilePic', account.profilePic);
    }
    await page.keyboard.type(account.email);
    await page.keyboard.press('Tab');
    await page.keyboard.type(account.password);
    await page.keyboard.press('Tab');
    await page.keyboard.type(account.password);
    await page.keyboard.press('Tab');
    await page.keyboard.type(account.displayName);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); //extra tab gets past Profile Pic
    await page.keyboard.type(account.securityQuestion);
    await page.keyboard.press('Tab');
    await page.keyboard.type(account.securityAnswer);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Submit the form
  }

  //Helper function to retrieve stored account from local storage
  async function getStoredAccount(page, email) {
    const storedAccount = await page.evaluate((email) => {
      return localStorage.getItem(email);
    }, email);
    return JSON.parse(storedAccount);
  }

  //Helper function to convert image file to data URL
  async function getDataUrl(filePath) {
    const imagePath = path.resolve(filePath);
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    return `data:image/jpeg;base64,${imageBase64}`;
  }

  //Start each test at "Create Account" page
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5500');
  
    // Ensure the initial focus is on the body
    await page.evaluate(() => document.body.focus());
  
    // Add delays to simulate real user interactions
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Email field
    await page.keyboard.press('Tab'); // Password field
    await page.keyboard.press('Tab'); // Log In button
    await page.keyboard.press('Tab'); // Create Account button
    await page.keyboard.press('Enter'); // Press Create Account button
    // Wait for the form submission to complete and the page to transition
  });

  test.afterEach(async ({ page }) => {
    // Clear local storage after each test
    await page.evaluate(() => localStorage.clear());
  });

  test('should create new account with valid data and default profile pic', async ({ page }) => {
    const userData = generateAccountData();
    await submitForm(page, userData);  
    await expect(page.locator('#loginPage')).toBeVisible();
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