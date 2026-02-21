# Antigravity IDEのチャット入力欄でEnterキーが送信されてしまう問題を修正するためのプラン。優先度の大幅引き上げと、when句の拡張、およびデバッグログの強化を行います。

## Proposed Changes

### [no-send-enter 拡張機能]

#### [MODIFY] [package.json](file:///Users/kimura512/dev/no-send-enter/package.json)
- キーバインドの `priority` を `9999` に引き上げ、内部のデフォルトキーバインドを確実に上書きします。
- `when` 句に一般的なチャットフォーカスのコンテキストキー (`inChatInput`, `chatInputFocus`) を追加し、あらゆるチャット実装で反応するようにします。

#### [MODIFY] [extension.ts](file:///Users/kimura512/dev/no-send-enter/src/extension.ts)
- 送信コマンドの候補に `antigravity.agent.submit` や `workbench.action.chat.run` など、可能性のあるIDを追加しました。
- 送信処理のログを強化しました。
