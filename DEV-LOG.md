# Development Log

## 2026-02-17 — v0.1.0 初期実装

### やったこと

1. **プロジェクト初期化** — `.gitignore`, `package.json`, `tsconfig.json`, `jest.config.js` を作成
2. **拡張マニフェスト定義** — 2コマンド (`newline`, `send`)、8キーバインド（4コンテキスト × Enter/Ctrl+Enter）、1設定項目 (`enabled`)
3. **extension.ts 実装** — `isEnabled()` ガード + `type` コマンドで改行挿入 + `Promise.allSettled` で送信コマンド発火
4. **テスト環境構築** — vscode モックを作成、Jest + ts-jest で13テスト（カバレッジ100%）
5. **ドキュメント作成** — README.md, ARCHITECTURE.md, DEV-LOG.md

### 技術判断

- **`Promise.allSettled` で複数送信コマンド発火**: Copilot / Cursor / Webview系で送信コマンドが異なるため、既知のコマンドを全て試行する方式を採用。該当しないコマンドは no-op。
- **二層の有効/無効チェック**: when句（宣言的）+ `isEnabled()`（命令的）の二重ガードで確実に無効化できる設計。
- **pnpm 使用**: パッケージマネージャは pnpm で統一。
