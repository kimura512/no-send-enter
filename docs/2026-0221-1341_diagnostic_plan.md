# 診断版 No-Send-Enter ビルド計画

## 問題の本質

1. VS Code の KeybindingService は Enter キーイベントを受信している
2. Cursor のチャットは React/Lexical のイベントハンドラで送信を処理している
3. 推測: `contenteditable` div が `editorTextFocus = true` として扱われている可能性

## 診断アプローチ

`when` 句を最小限（`config.noSendEnter.enabled` のみ）にして、keybinding が発火するか確認する。

| シナリオ | Output パネルのログ | 意味 |
|---|---|---|
| A: 発火する | `newline command executed` が出る | `when` 句の問題 → 正しい条件を特定すれば解決 |
| B: 発火しない | ログなし | DOM レベルで横取りされておりkeybindingでは不可能 |
