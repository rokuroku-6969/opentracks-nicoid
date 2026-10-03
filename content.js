// 保存データの有効期間
const EXPIRE_MS = 24 * 60 * 60 * 1000;

// 有効期間を過ぎた保存データを削除する関数
function removeExpiredData() {
  chrome.storage.local.get(null, (items) => {
    const now = Date.now();
    const expiredKeys = Object.keys(items).filter((key) =>
      key.startsWith('bgm_') &&
      !(items[key] && now - items[key].savedAt < EXPIRE_MS)
    );
    if (expiredKeys.length) {
      chrome.storage.local.remove(expiredKeys);
    }
  });
}

// ニコニコ動画の親作品IDを取得
const targetNicoId = document.querySelector('.trialL-DLniconico dd');
// 作曲者名を取得
const targetComposerName = document.querySelector('.trialL-subm_composerName div a');

// URLから作品IDを取得（/bgm/detail/<作品ID>/...）
const trackIdMatch = location.pathname.match(/\/bgm\/detail\/([^\/]+)/);
const trackId = trackIdMatch ? trackIdMatch[1] : '';
const storageKey = `bgm_${trackId}`;

// ダウンロードページ以外で初期化
const isDownloadPage = /\/download\/?$/.test(location.pathname);

if (trackId) {
  chrome.storage.local.get(storageKey, (result) => {
    const saved = result[storageKey] || {};

    // ダウンロードページでは既存の保存値を引き継ぎ、それ以外では初期化
    const setData = isDownloadPage
      ? { savedNicoId: '', savedComposerName: '', ...saved }
      : { savedNicoId: '', savedComposerName: '' };

    if (targetNicoId) {
      // 前後の空白や改行を削除して文字列を取得
      const insertTextNicoId = targetNicoId.innerText.trim();
      if (insertTextNicoId) {
        setData.savedNicoId = insertTextNicoId;
      }
    }

    if (targetComposerName) {
      const insertComposerName = targetComposerName.innerText.trim();
      if (insertComposerName) {
        setData.savedComposerName = insertComposerName;
      }
    }

    // 保存日時を記録
    setData.savedAt = Date.now();

    // 親作品IDごとに保存
    chrome.storage.local.set({ [storageKey]: setData }, removeExpiredData);
  });
}
