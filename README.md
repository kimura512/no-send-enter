# No-Send-Enter

VS Code / Cursor のAIチャットで **Enter = 改行、Ctrl/Cmd+Enter = 送信** に変更する拡張機能。

## なぜ必要か

GitHub Copilot Chat や Cursor の AIチャットでは、Enter を押すと即座にメッセージが送信される。長文のプロンプトを書きたいとき、意図せず途中で送信してしまう問題を解消する。

## 動作

```
変更前:  Enter → 送信  /  Shift+Enter → 改行
変更後:  Enter → 改行  /  Ctrl+Enter (Win) · Cmd+Enter (Mac) → 送信
```

## 対応チャット

| チャット | when句コンテキスト |
|---|---|
| GitHub Copilot Chat（サイドバー） | `inChatInput` |
| インラインチャット | `interactiveEditorFocused` |
| Cursor AI Chat | `cursorChatFocus` |
| Webviewベース（Antigravity等） | `webviewFocus` |

## インストール

### VSIX から（ローカルビルド）

```bash
pnpm install
pnpm compile
pnpm package          # no-send-enter-0.1.0.vsix が生成される
code --install-extension no-send-enter-0.1.0.vsix
```

### マーケットプレイスから

> 準備中

## 設定

`settings.json` で機能の ON/OFF を切り替え可能：

```json
{
  "noSendEnter.enabled": true
}
```

`false` にすると拡張機能の全機能が無効化され、デフォルトの挙動に戻る。

## コマンド

| コマンド | 説明 |
|---|---|
| `No-Send-Enter: Send Message` | メッセージを送信する |
| `No-Send-Enter: Insert Newline` | 改行を挿入する |

キーボードショートカット設定画面からこれらのコマンドに任意のキーを割り当て可能。

## 動作環境

- VS Code `^1.80.0`
- Cursor（VS Code互換）

## ライセンス

MIT
