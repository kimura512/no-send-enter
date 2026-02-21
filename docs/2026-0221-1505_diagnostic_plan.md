# Antigravity Enterキー挙動修正：診断と修正プラン

デバッグログにより、拡張機能は正常に読み込まれているものの、Enterキー押下時にコマンドが発火していないことが判明しました。これは `package.json` の `when` 句（コンテキストキー）が一致していないことを強く示唆しています。

## 修正の方針

Antigravityのエージェントモード入力欄で確実にキーバインドを有効化するため、`when` 句に候補となるコンテキストキーを網羅的に追加します。また、優先度を最高レベルに維持します。

## Proposed Changes

### [MODIFY] [package.json](file:///Users/kimura512/dev/no-send-enter/package.json)

`when` 句に以下のコンテキストキーを追加・拡充します。

- `antigravity.agentModeFocused` (推測)
- `focusedView == 'antigravity.agentSidePanelInputBox'` (過去の調査ログより)
- `chatFocused` / `chatInputFocused` (VS Code標準)
- `onAntigravityAgentMode` (推測)

```json
"when": "config.noSendEnter.enabled && (antigravity.isAgentModeInputBoxFocused || inChatInput || chatInputFocus || chatFocused || chatInputFocused || isLexicalEditorFocused || focusedView == 'antigravity.agentSidePanelInputBox')"
```

## Verification Plan

### Manual Verification
1. ユーザーに `pnpm run compile && pnpm run package` を実行してもらい、VSIXを再インストール。
2. Antigravityを再起動。
3. デバッグログ（Outputパネル）に `>>> newline command FIRED! <<<` が出るか確認。
4. もしこれでも出ない場合は、ユーザーに「開発者：コンテキストキーの検査 (Developer: Inspect Context Keys)」コマンドの実行を依頼する。
