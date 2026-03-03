# job-cant2

### Setup

##### パッケージのインストール

```
$ npm ci
$ npx playwright install chromium
```

##### env ファイルの設置

```
$ cp .env.template .env
$ vim .env

＊以下の3項目を記入してください
JOBCAN_EMAIL / メールアドレス (例: iida.t-je@nhk.or.jp)
MS_LOGIN_ID / AD認証のID (例: 0000538747@nhk.or.jp)
MS_LOGIN_PASSWORD / AD認証のパスワード
```

### Execution

##### 退勤打刻の基本

```
$ ./bin/end -m"業務内容のコメント"
```

##### 業務内容のメッセージに改行を入れる

```
$ ./bin/end -m"メッセージ1;メッセージ2;メッセージ3"
```

##### Outlook のスケジュールを業務内容のメッセージに含める

```
$ ./bin/end -c
```

##### -c と-m オプションを組み合わせる

```
$ ./bin/end -c -m"メッセージ1;メッセージ2;メッセージ3"


カレンダーのサマリの後にメッセージが追記される形式になります。

(出力例)
10:00-11:00 MTG A
13:30-14:00 MTG B

メッセージ1
メッセージ2
メッセージ3
```

##### ブラウザの自動操作を確認する場合

```
$ ./bin/end -h
```

##### 実際の退勤打刻をしない

```
$ ./bin/end -m"メッセージ1" -h -n
```

### Troubleshouting

##### wsl で文字化けする場合

```
$ sudo apt-get install fonts-ipafont-gothic fonts-ipafont-mincho
```

##### カレンダータイトルのスキップをカスタマイズしたい

.env に下記行を追記してください。カンマ区切りで複数設定が可能です。

```
CALENDAR_SKIP_WORDS="Canceled:,(件名なし)"
```
