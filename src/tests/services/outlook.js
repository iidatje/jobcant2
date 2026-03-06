import { handleMicrosoftLogin } from './auth.js';

export async function getOutlookEvents(page) {
  await page.goto('https://outlook.office365.com/calendar/view/day');

  // Outlookページで再度ログインが必要な場合に対応
  await handleMicrosoftLogin(page);

  try {
    await page.waitForSelector('.calendar-SelectionStyles-resizeBoxParent', {
      timeout: 30000,
    });
  } catch (e) {
    console.log('Outlook calendar cells not found.');
    await page.screenshot({ path: 'screenshots/outlook_error.png' });
    return '';
  }

  const cellLocator = page.locator('.calendar-SelectionStyles-resizeBoxParent');

  // skipしたいカレンダーのタイトル
  var skipWords = ['Canceled:', '(件名なし)'];
  if (process.env.CALENDAR_SKIP_WORDS !== undefined) {
    skipWords = process.env.CALENDAR_SKIP_WORDS.split(',');
  }

  var calendarMessageList = [];

  parseCell: for (const cell of await cellLocator.all()) {
    const accepted = await cell.locator('div').first().getAttribute('class');

    // 返事をしていないものは(斜線表示)スキップする
    if (accepted.indexOf('Zn9Tu') === -1) {
      continue;
    }

    const attr = await cell.locator('[role="button"]').getAttribute('title');
    if (!attr) continue;

    const items = attr.split('\n', 3);

    var title = '';
    var time = '';
    var count = 0;

    for (const item of items) {
      if (count === 0) {
        // 先頭はタイトル
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
        // 時刻レンジ [10:00 から 19:00]
        const match = item.match(/(\d{1,2}:\d{1,2})\D*(\d{1,2}:\d{1,2})/);
        if (match) {
          time = match[1] + '-' + match[2];
        }
      }
      count++;
    }

    // タイトルでスキップ判定
    for (const word of skipWords) {
      if (title.indexOf(word) === 0) {
        continue parseCell;
      }
    }

    calendarMessageList.push(time + ' ' + title);
  }

  // 時刻順にソート
  calendarMessageList.sort();
  return calendarMessageList.join('\n');
}
