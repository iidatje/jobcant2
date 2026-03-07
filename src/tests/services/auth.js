import { expect } from '@playwright/test';

export async function handleMicrosoftLogin(page) {
  try {
    // MS Login #1 (メールアドレス入力)
    // ログイン画面が表示されている場合のみ実行
    const emailInput = page.getByPlaceholder('メール、電話、Skype');
    if (await emailInput.isVisible({ timeout: 5000 })) {
      await emailInput.click();
      await emailInput.fill(process.env.MS_LOGIN_ID);
      await page.getByRole('button', { name: '次へ' }).click();

      // MS Login #2 (パスワード入力)
      await page
        .getByPlaceholder('パスワード')
        .fill(process.env.MS_LOGIN_PASSWORD);
      await page.getByRole('button', { name: 'サインイン' }).click();
      await page.waitForLoadState();

      // MS Login #3 (サインインの状態維持確認)
      const checkbox = page.getByRole('checkbox', {
        name: '今後このメッセージを表示しない',
      });
      if (await checkbox.isVisible({ timeout: 5000 })) {
        await checkbox.click();
        await page.getByRole('button', { name: 'はい' }).click();
      }
      await page.waitForLoadState();
    }
  } catch (e) {
    console.log(
      'Microsoft login skipped or failed (already logged in?):',
      e.message,
    );
  }
}
