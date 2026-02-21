# Development Log

## 2026-02-17 — v0.1.0 初期実装

### やったこと

1. **プロジェクト初期化** — `.gitignore`, `package.json`, `tsconfig.json`, `jest.config.js` を作成
2. **拡張マニフェスト定義** — 2コマンド (`newline`, `send`)、6キーバインド（3コンテキスト × Enter/Ctrl+Enter）、1設定項目 (`enabled`)
3. **extension.ts 実装** — `isEnabled()` ガード + `type` コマンドで改行挿入 + `Promise.allSettled` で送信コマンド発火
4. **テスト環境構築** — vscode モックを作成、Jest + ts-jest で13テスト（カバレッジ100%）
5. **ドキュメント作成** — README.md, ARCHITECTURE.md, DEV-LOG.md

### 技術判断

- **`Promise.allSettled` で複数送信コマンド発火**: Copilot / Cursor で送信コマンドが異なるため、既知のコマンドを全て試行する方式を採用。該当しないコマンドは no-op。
- **二層の有効/無効チェック**: when句（宣言的）+ `isEnabled()`（命令的）の二重ガードで確実に無効化できる設計。
- **pnpm 使用**: パッケージマネージャは pnpm で統一。

---

## 2026-02-17 — v0.1.0 修正（コマンドID・コンテキストキーの検証）

### 経緯

初期実装ではモックベースの単体テスト（カバレッジ100%）を根拠に「完了」と報告したが、VS Code / Cursor の実際のソースコードと照合していなかった。テストは「コードが自分の期待通りに動くか」を検証していたが、「期待自体が正しいか」は未検証だった。

### 発見された問題と修正

| 項目 | 旧（間違い） | 新（正しい） | 根拠 |
|---|---|---|---|
| 送信コマンド (VS Code) | `workbench.action.chat.send` | `workbench.action.chat.submit` | VS Code ソース `chatExecuteActions.ts` |
| 送信コマンド (Cursor) | `chat.action.submit` | `aichat.sendMessage` | Cursor コミュニティ情報 |
| インラインチャット when句 | `interactiveEditorFocused` | `inlineChatFocused` | VS Code ソース `inlineChat.ts` |
| Cursor when句 | `cursorChatFocus` | `aichatInputFocus` | Cursor キーバインドダンプ |
| Webview対応 | `webviewFocus` でバインド | **削除** | webview内はiframeで `type` コマンド到達不可 |
| tsconfig | `declaration: true` | `declaration: false` | 拡張機能に不要、コンパイルエラーの原因 |

### 教訓

- **モックベースのテストは内部整合性しか保証しない。** 外部API（コマンドID、コンテキストキー）の正しさは、実際のソースコードやドキュメントとの照合が必須。
- **カバレッジ100% ≠ 正しさ。** モックの前提が間違っていれば、全テスト通過でもバグがある。
- **Webviewベースのチャットは拡張側から制御できない。** iframe内のDOMはVS Codeのキーバインドシステムから独立している。

---

## 2026-02-20 — v0.1.1 欠陥修正

### 修正内容

1. **戻り値の一貫性** — コマンドが無効な場合でも `Promise<void>` を返すように修正
2. **エラーハンドリング追加** — `executeCommand` の呼び出しを try-catch でラップし、グレースフルデグラデーションを実装
3. **デバッグログ機能追加** — 新しい設定 `noSendEnter.debug` を追加。有効にすると Output パネルにログを出力
4. **設定の堅牢性** — `getConfiguration` が 例外を投げた場合ojisaku のデフォルト値を返すように修正
5. **テスト拡張** — エッジケーステストを7件追加（20テスト、カバレッジ90%）

### 技術判断

- **デバッグログはオプトイン**: デフォルトは `false`。パフォーマンスオーバーヘッドを避けるため。
- **エラーはユーザーに表示しない**: ログに記録するだけで、ユーザーにポップアップを表示しない（ユーザー体験を損なわない）
- **二層チェックは維持**: when句 + isEnabled() の両方を維持し、「多層防御」の設計思想を踏襲

### 新規追加ファイル

- `.vscodeignore` — VSIX に含めるファイルを制限
- `LICENSE` — MIT ライセンスファイル追加

---

## 2026-02-21 — デバッグ情報の場所の再確認

### やったこと

1. **デバッグ情報の解説作成** — 出力先（Output パネルの "No-Send-Enter" チャンネル）と有効化方法 (`noSendEnter.debug`) をドキュメント化。

| 2026-02-21 14:58 | 保存: 2026-0221-1457_implementation_plan.md - デバッグ情報解説の実施計画|
| 2026-02-21 15:02 | 保存: 2026-0221-1457_explanation.md - デバッグ情報の出力先と有効化方法の解説|
| 2026-02-21 15:02 | 保存: DEV-LOG.md - ログ追記|
| 2026-02-21 15:05 | 調査: デバッグログにより拡張機能の有効化は確認。Enterがトラップされないのは when 句の不一致が濃厚。|
| 2026-02-21 15:05 | 保存: diagnostic_plan.md - when 句を網羅的に広げる診断プランを作成。|
| 2026-02-21 15:10 | 修正: package.json の when 句に `chatFocused`, `focusedView` 等を追加。VSIX 再ビルド完了。|
| 2026-02-21 15:25 | 調査: Lexical エディタ（contenteditable）であることが確定。イベントバブリングが Webview 内で停止している可能性が大。|
| 2026-02-21 15:25 | 方針変更: VS Code 拡張レイヤーでの解決を諦め、OSレイヤー（Karabiner-Elements）での解決を提案。|
