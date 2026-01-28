const { test, expect } = require('@playwright/test');

test.describe('Auto-save Debug', () => {
  test('should log save events on level up', async ({ page }) => {
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.goto('http://localhost:8080');
    await page.waitForTimeout(3000);

    // Wait for game to be initialized
    await page.waitForFunction(() => {
      return window.game && window.game.scene && window.game.scene.scenes;
    }, { timeout: 10000 });

    // Force level up
    await page.evaluate(() => {
      const scene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
      scene.gainXP(1000); // Force level up
    });

    await page.waitForTimeout(2000);

    // Check logs
    const autoSaveLogs = logs.filter(log => log.includes('autoSave') || log.includes('💾'));
    console.log('Auto-save logs:', autoSaveLogs);

    expect(autoSaveLogs.length).toBeGreaterThan(0);
  });
});
