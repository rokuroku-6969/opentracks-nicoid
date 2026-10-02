// ニコニコ動画の親作品IDを取得
const targetNicoId = document.querySelector('.trialL-DLniconico dd');
// 作曲者名を取得
const targetComposerName = document.querySelector('.trialL-subm_composerName div a');

// ダウンロードページ以外で初期化
const isDownloadPage = /\/download\/?$/.test(location.pathname);
if (!isDownloadPage) {
  browser.storage.local.set({
    savedNicoId: '',
    savedComposerName: ''
  });
}

if (targetNicoId) {
  // 前後の空白や改行を削除して文字列を取得
  const insertTextNicoId = targetNicoId.innerText.trim();
  if (insertTextNicoId) {
    browser.storage.local.set({ savedNicoId: insertTextNicoId });
  }
}

if (targetComposerName) {
  const insertComposerName = targetComposerName.innerText.trim();
  if (insertComposerName) {
    browser.storage.local.set({ savedComposerName: insertComposerName });
  }
}
