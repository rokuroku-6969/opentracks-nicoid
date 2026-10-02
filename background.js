const DEFAULT_PATTERN = '${title}_${Id}';
const DEFAULT_NO_ID_PATTERN = '${title}';

const TARGET_DOMAIN = 'https://opentracks.com/'

// ファイル名に使えない記号を大文字に置換する関数
function replaceSpecialChars(filename) {
  const chars = {
    '/': '／',
    '?': '？',
    '<': '＜',
    '>': '＞',
    '\\': '＼',
    ':': '：',
    '*': '＊',
    '|': '｜',
    '.': '．',
    ',': '，',
    '\"': '”'
  };
  for (let char in chars) {
    filename = filename.replace(char, chars[char]);
  }
  return filename;
}

// optionsとbackgroundの送受信処理
// ファイルのパターンを受け取り各処理に分ける
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // パターンを呼び出す
  if (message.content === 'getPattern') {
    browser.storage.local.get(['filePatternWithId', 'filePatternNoId'], options => {
      sendResponse({
        'filePatternWithId': options['filePatternWithId'],
        'filePatternNoId': options['filePatternNoId'],
      });
    });
    return true;
  }

  // パターンを保存する
  if (message.content === 'savePattern') {
    browser.storage.local.set({
      filePatternWithId: message['filePatternWithId'],
      filePatternNoId: message['filePatternNoId'],
    });
    return true;
  }
});

// ダウンロード実行時
browser.downloads.onDeterminingFilename.addListener((item, suggest) => {
  const isTargetUrl = (item.url && item.url.includes(TARGET_DOMAIN)) ||
    (item.referrer && item.referrer.includes(TARGET_DOMAIN));

  // 対象サイト以外からのダウンロードの場合は何もせずにスキップ
  if (!isTargetUrl) {
    suggest();
    return true;
  }

  // 保存された文字列とユーザーの設定パターンを取得
  browser.storage.local.get(
    ['savedNicoId', 'savedComposerName', 'filePatternWithId', 'filePatternNoId'],
    (result) => {
      const insertNicoId = result.savedNicoId || '';
      const insertComposerName = result.savedComposerName || '';

      // 情報が何も保存されていない場合は元のファイル名のままにする
      if (!insertNicoId && !insertComposerName) {
        suggest();
        return;
      }

      const originalName = item.filename;
      const lastDotIndex = originalName.lastIndexOf('.');

      let namePart = '';
      let extPart = '';

      // 拡張子が存在しないかをチェック(念のため)
      if (lastDotIndex === -1) {
        namePart = originalName;
        extPart = '';
      } else {
        namePart = originalName.substring(0, lastDotIndex);
        extPart = originalName.substring(lastDotIndex);
      }

      // ファイル名に使えない記号を変換
      const safeTitle = replaceSpecialChars(namePart);
      const safeNicoId = replaceSpecialChars(insertNicoId);
      const safeComposerName = replaceSpecialChars(insertComposerName);

      // IDが存在するかどうかでパターンを選択（設定が未保存の場合はデフォルト値を使用）
      const patternTemplate = safeNicoId
        ? (result.filePatternWithId || DEFAULT_PATTERN)
        : (result.filePatternNoId || DEFAULT_NO_ID_PATTERN);

      // パターン内の各変数を実際の値に置換
      let newBaseName = patternTemplate
        .replace(/\$\{title\}/g, safeTitle)
        .replace(/\$\{Id\}/g, safeNicoId)
        .replace(/\$\{creator\}/g, safeComposerName);

      // 組み立て後のファイル名を安全にして拡張子を結合
      newBaseName = replaceSpecialChars(newBaseName);
      const newFileName = `${newBaseName}${extPart}`;

      // 新しいファイル名を適用
      suggest({ filename: newFileName });
    }
  );

  return true;
});
