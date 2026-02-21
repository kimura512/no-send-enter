# Cursor での Enter キー動作不具合の修正プラン

Cursor の AI チャット入力欄で Enter キーを押した際に改行されず送信されてしまう問題は、Cursor の内包するチャット入力欄が通常の VS Code 拡張機能の `inChatInput` などの標準コンテキストキーとは異なる独自の `when` コンテキスト（例: `composer.isEditing` や `aichat.input.focus` 等）を使用していることが原因です。

この問題を解決し、Cursor 環境でも期待通り動作させるための修正を提案します。

## Proposed Changes

### [MODIFY] [package.json](file:///Users/kimura512/dev/no-send-enter/package.json)
`contributes.keybindings` に設定されている `noSendEnter.newline` (Enter) と `noSendEnter.send` (Ctrl/Cmd+Enter) の `when` 句を拡張し、Cursor 独自のものと考えられるコンテキストキーを追加します。

具体的には、それぞれの `when` 句を以下のように修正します。

**変更前:**
```json
"when": "inChatInput && config.noSendEnter.enabled"
// 他、inlineChatFocused, aichatInputFocus 用の定義が存在
```

**変更後案:** (それぞれのキーバインディングを統合・拡張するか、複数定義を拡張します)
```json
"when": "(inChatInput || inlineChatFocused || aichatInputFocus || cursorChatInputFocus || aichat.input.focus || composerInputFocus || composer.isEditing || inComposer || editorPromptBarFocused || cursor.chat.active) && config.noSendEnter.enabled"
```
（対象となるすべての `enter` と `ctrl+enter`/`cmd+enter` の keybinding について適用します）

---

## Verification Plan

### Manual Verification
1. 修正した `package.json` を元に `npm run package` で新しい `.vsix` ファイルを作成します。
2. 作成した `.vsix` を Cursor にインストールします。
3. Cursor のチャット（または Composer）入力欄で動作を確認します。
   - `Enter` キーを押下した際、メッセージが送信されず「改行」されること。
   - `Ctrl+Enter` (Macの場合は `Cmd+Enter`) を押下した際、メッセージが正しく「送信」されること。

ご確認よろしくお願いします！承認いただけましたら、修正とビルドに進みます。
