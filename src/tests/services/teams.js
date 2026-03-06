export async function postToTeams(page, channelUrl, message) {
  if (!channelUrl || !message) {
    console.log('Teams post skipped: channelUrl or message is missing.');
    return;
  }

  console.log('Posting to Teams...');
  await page.goto(channelUrl);

  try {
    // Teamsのロード待ち
    await page.waitForLoadState('networkidle');

    // 「新しい投稿」ボタンを探す (日本語環境前提)
    // "新しい投稿を開始" や "投稿を開始する" などのボタン
    const newPostButton = page
      .getByRole('button', { name: '新しい投稿' })
      .first();
    await newPostButton.waitFor({ state: 'visible', timeout: 60000 });
    await newPostButton.click();

    // 入力エリア (contenteditable)
    const editor = page.locator('div[contenteditable="true"]').first();
    await editor.waitFor({ state: 'visible' });
    await editor.click();
    await editor.fill(message);

    // 送信ボタン (紙飛行機アイコンなど、"投稿" という名前のボタン)
    const sendButton = page.getByRole('button', { name: '投稿' }).last();
    await sendButton.click();

    // 送信完了を少し待つ
    await page.waitForTimeout(5000);
    console.log('Posted to Teams successfully.');
  } catch (e) {
    console.error('Failed to post to Teams:', e);
    // スクリーンショットを撮ってデバッグしやすくする
    await page.screenshot({ path: 'screenshots/teams_error.png' });
  }
}
