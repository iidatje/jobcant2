import { test, expect, chromium } from '@playwright/test';

const USER_DATA_DIR = '/tmp/.user-data';

const isAfterMidnight = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const midnight = new Date(year, month, day, 0, 0, 0);
  const morning = new Date(year, month, day, 5, 0, 0); // 6時だったかもしれない

  return now >= midnight && now < morning;
};

test('jobcant2-dakoku-execution', async () => {
  test.setTimeout(60000);

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    viewport: { width: 393, height: 852 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 26_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1',
    locale: 'ja_JP',
    timezoneId: 'Asia/Tokyo',
    permissions: ['geolocation'],
    geolocation: { latitude: 35.6659, longitude: 139.69634 },
    bypassCSP: true,
    args: ['--disable-web-security'],
    ignoreHTTPSErrors: true,
  });
  const page =
    context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  var message = '';
  var isDryrun = false;
  var isCalendarSync = false;

  if (process.env.JC_MSG !== undefined) {
    message = process.env.JC_MSG;
    message = message.replace(/;/g, '\n');
  }

  if (process.env.JC_DRYRUN !== undefined && process.env.JC_DRYRUN == 'true') {
    isDryrun = true;
  }

  if (
    process.env.JC_CALENDAR_SYNC !== undefined &&
    process.env.JC_CALENDAR_SYNC == 'true'
  ) {
    isCalendarSync = true;
  }

  await page.goto('https://id.jobcan.jp/users/saml/sign_in');
  await page.getByPlaceholder('会社ID').fill(process.env.JOBCAN_COMPANY_ID);
  await page.getByRole('button', { name: 'ログイン' }).click();

  // MS Login #1
  await page.getByPlaceholder('メール、電話、Skype').click();
  await page
    .getByPlaceholder('メール、電話、Skype')
    .fill(process.env.MS_LOGIN_ID);
  await page.getByRole('button', { name: '次へ' }).click();

  // MS Login #2
  await page.getByPlaceholder('パスワード').fill(process.env.MS_LOGIN_PASSWORD);
  await page.getByRole('button', { name: 'サインイン' }).click();
  await page.waitForLoadState();

  // MS Login #3
  await page
    .getByRole('checkbox', { name: '今後このメッセージを表示しない' })
    .click();
  await page.getByRole('button', { name: 'はい' }).click();
  await page.waitForLoadState();

  // outlook
  if (isCalendarSync) {
    await page.goto('https://outlook.office365.com/calendar/view/day');

    await page.waitForSelector('.calendar-SelectionStyles-resizeBoxParent');
    const cellLocator = page.locator(
      '.calendar-SelectionStyles-resizeBoxParent',
    );

    // skipしたいカレンダーのタイトルはenvのコピー忘れを考慮して、2つのよくあるやつを
    var skipWords = new Array('Canceled:', '(件名なし)');

    if (process.env.CALENDAR_SKIP_WORDS !== undefined) {
      skipWords = process.env.CALENDAR_SKIP_WORDS.split(',');
    }

    var calendarMessageList = new Array();

    parseCell: for (const cell of await cellLocator.all()) {
      const accepted = await cell.locator('div').first().getAttribute('class');

      // 返事をしていないものは(斜線表示)スキップする
      if (accepted.indexOf('Zn9Tu') === -1) {
        continue;
      }

      const attr = await cell.locator('[role="button"]').getAttribute('title');
      const items = attr.split('\n', 3);

      var title = '';
      var time = '';
      var count = 0;

      for (const item of items) {
        if (count === 0) {
          // 先頭はタイトルなはず
          title = item;
        } else if (
          item === 'Microsoft Teams Meeting' ||
          item === 'Microsoft Teams 会議'
        ) {
          // nothing todo
        } else if (item.match(/^\d{4}\D+\d{1,2}\D+\d{1,2}/)) {
          // 終日 [2023 年 7 月 12 日 (水曜日)]
          time = '終日';
        } else {
          // elseで時刻というのはちょっと弱いかもしれない
          // 時刻レンジ [10:00 から 19:00]
          const match = item.match(/(\d{1,2}:\d{1,2})\D*(\d{1,2}:\d{1,2})/);

          if (match) {
            time = match[1] + '-' + match[2];
          }
        }

        count++;
      }

      // タイトルだけ拾ってすぐに判定してもいいかもしれない
      for (const word of skipWords) {
        if (title.indexOf(word) === 0) {
          continue parseCell;
        }
      }

      calendarMessageList.push(time + ' ' + title);
    }

    // 時刻順でいいよね？
    calendarMessageList.sort();
    message = calendarMessageList.join('\n') + '\n\n' + message;

    console.log(message);
  }

  // ここを踏むと「アカウント情報」
  await page.goto('https://ssl.jobcan.jp/jbcoauth/login');
  await page.waitForLoadState();

  // こいつを開くと
  await page.goto('https://ssl.jobcan.jp/employee');
  //await page.waitForTimeout(5000);
  await page.waitForLoadState();

  // モバイルが開ける
  await page.goto('https://ssl.jobcan.jp/m/index');
  //await page.waitForTimeout(5000);
  await page.waitForLoadState();

  // GPS記録
  await page.getByText('外出先GPS記録').click();
  await page.waitForLoadState();

  // GPS記録実行
  await page.getByRole('button', { name: 'GPS記録' }).click();
  await page.waitForLoadState();

  // 位置情報取得
  // 当該オリジンに geolocation を明示付与しないと「あなたのリクエストしたURLは有効でないか、ページが削除された可能性があります。」のエラーになる。
  const origin = new URL(page.url()).origin;
  await context.grantPermissions(['geolocation'], { origin });

  // 権限状態を即確認（debug用）
  const state = await page.evaluate(async () => {
    const st = await navigator.permissions.query({ name: 'geolocation' });
    return st.state; // 'granted' になっていればOK
  });
  console.log('Geolocation permission state:', state);

  await page.getByRole('button', { name: '位置情報取得' }).click();
  await page.waitForLoadState();

  // スクリーンショット保存 (ホストOSの screenshots/ ディレクトリに同期されます)
  await page.screenshot({ path: 'screenshots/gps_record.png' });

  // 「打刻」
  //await page.goto("https://ssl.jobcan.jp/m/work/accessrecord?_m=adit");
  //await page.waitForLoadState();

  // 押下
  //await page.waitForSelector("#idRichContext_DisplaySign");

  //<textarea name="reason" id="reason" rows="5" cols="22"></textarea>
  await page.waitForSelector('#reason');
  const reasonTextArea = page.locator('#reason');
  await reasonTextArea.click();
  await reasonTextArea.fill(message);

  // 24時をまたぐ場合は「2暦日打刻モード」を選択する
  if (isAfterMidnight()) {
    await page.getByLabel('2暦日打刻モード').check();
  }

  await page.getByRole('button', { name: '退勤' }).click();
  await page.waitForLoadState();

  // 強制的にgeo情報を使用するとここは不要になる
  //await page.getByRole("button", { name: "位置情報取得" }).click();
  //await page.waitForLoadState();

  // dry-run trueのときは「いいえ」で終了
  isDryrun = true;
  const executeButtonName = isDryrun ? 'いいえ' : 'はい';
  await page.getByRole('button', { name: executeButtonName }).click();

  await page.waitForTimeout(10000);
  await context.close();
});
