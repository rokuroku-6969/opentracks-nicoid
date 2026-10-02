// デフォルトのファイル名パターン
const DEFAULT_PATTERN = '${title}_${Id}';
const DEFAULT_NO_ID_PATTERN = '${title}';

const changePatternOption = () => {
  const pattern = document.getElementById('patternWithId').value.trim() || DEFAULT_PATTERN;
  const noIdPattern = document.getElementById('patternNoId').value.trim() || DEFAULT_NO_ID_PATTERN;

  browser.runtime.sendMessage({
    'content': 'savePattern',
    'filePatternWithId': pattern,
    'filePatternNoId': noIdPattern,
  });
}

// オプション画面の読み込み時処理
document.addEventListener('DOMContentLoaded', () => {
  browser.runtime.sendMessage(
    {
      'content': 'getPattern'
    },
    (items) => {
      const gotFilePatternWithId = items['filePatternWithId'] || DEFAULT_PATTERN;
      const gotFilePatternNoId = items['filePatternNoId'] || DEFAULT_NO_ID_PATTERN;

      document.getElementById('patternWithId').value = gotFilePatternWithId;
      document.getElementById('patternNoId').value = gotFilePatternNoId;
      document.getElementById('patternWithId').addEventListener('input', changePatternOption);
      document.getElementById('patternNoId').addEventListener('input', changePatternOption);
    }
  );
});
