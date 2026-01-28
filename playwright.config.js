import { defineConfig, devices } from '@playwright/test';

/**
 * Forest Quest RPG - Playwright配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* 并行运行测试文件 */
  fullyParallel: false,  // 游戏测试需要串行运行

  /* 在CI中失败时重试 */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,

  /* 在CI中并行worker数 */
  workers: 1,  // 游戏测试只能使用1个worker

  /* 测试报告配置 */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],

  /* 全局设置 */
  use: {
    /* 基础URL */
    baseURL: 'http://127.0.0.1:55573',

    /* 收集失败测试的trace */
    trace: 'on-first-retry',

    /* 截图配置 */
    screenshot: 'only-on-failure',

    /* 视频录制 */
    video: 'retain-on-failure',

    /* 超时时间 */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* 项目配置 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* 开发服务器 */
  webServer: {
    command: 'npx -y http-server -p 55573 --silent',
    url: 'http://127.0.0.1:55573',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
