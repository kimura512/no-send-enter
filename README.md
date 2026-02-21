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

| チャット | when句コンテキスト | 送信コマンド |
|---|---|---|
| GitHub Copilot Chat（サイドバー） | `inChatInput` | `workbench.action.chat.submit` |
| インラインチャット | `inlineChatFocused` | `workbench.action.chat.submit` |
| Cursor AI Chat | `aichatInputFocus` | `aichat.sendMessage` |

> **Note:** Webviewベースのチャット（Antigravity等）は、webview内のiframeが独立したDOMを持つため、VS Code拡張のキーバインドでは制御できません。これらのツールは各拡張機能側での対応が必要です。

## Cursor (AI Chat / Composer) での利用について

Cursor の AI チャット入力欄は、VS Code 標準のエディタ UI（Monaco Editor）ではなく、独立した Web コンポーネント（Lexical）で実装されています。  
そのため、本拡張機能を含め **VS Code の Extension API からは Enter キーの入力を横取りして制御することができません**。

Cursor で「Enter で改行、Cmd/Ctrl + Enter で送信」を実現したい場合は、Cursor 自身の `keybindings.json` に手動で以下の設定を追記してください。

1. `Cmd + Shift + P` (Mac) / `Ctrl + Shift + P` (Win) でコマンドパレットを開く
2. `Preferences: Open Keyboard Shortcuts (JSON)` を選択する
3. 以下の設定を追加する（既存の配列 `[]` の中にカンマ区切りで追加）

```json
  {
    "key": "enter",
    "command": "type",
    "args": { "text": "\n" },
    "when": "composer.isEditing || aichat.input.focus || inComposer || cursorChatInputFocus"
  },
  {
    "key": "cmd+enter",
    "command": "composer.sendMessage",
    "when": "composer.isEditing || inComposer",
    "mac": "cmd+enter"
  },
  {
    "key": "ctrl+enter",
    "command": "composer.sendMessage",
    "when": "composer.isEditing || inComposer",
    "win": "ctrl+enter",
    "linux": "ctrl+enter"
  },
  {
    "key": "cmd+enter",
    "command": "aichat.submit",
    "when": "aichat.input.focus || cursorChatInputFocus",
    "mac": "cmd+enter"
  },
  {
    "key": "ctrl+enter",
    "command": "aichat.submit",
    "when": "aichat.input.focus || cursorChatInputFocus",
    "win": "ctrl+enter",
    "linux": "ctrl+enter"
  }
```

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
  "noSendEnter.enabled": true,
  "noSendEnter.debug": false
}
```

| 設定 | デフォルト | 説明 |
|---|---|---|
| `noSendEnter.enabled` | `true` | 拡張機能の有効/無効を切り替えます。`false` にするとデフォルトの挙動（Enter = 送信）に戻ります。 |
| `noSendEnter.debug` | `false` | デバッグログを有効にします。`true` にすると Output パネルに実行ログが出力されます。 |

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
