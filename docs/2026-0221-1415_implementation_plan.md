# No-Send-Enter: Antigravity対応プラン

Cursorのチャット入力欄ではキーバインドが正しく動作しなかったため、Google Antigravity IDEのチャット入力欄をターゲットに方針転換する。

## 調査結果サマリ

| 項目 | 結果 |
|---|---|
| Antigravityの正体 | VS Codeベースの独立Electronアプリ |
| チャット入力欄 | Lexicalエディタ（`contenteditable` + `data-lexical-editor`） |
| 入力ボックスID | `antigravity.agentSidePanelInputBox` |
| フォーカス判定 | `antigravity.isAgentModeInputBoxFocused` |
| 送信コマンド | `antigravity.sendChatActionMessage` |
| 既存拡張状態 | `no-send-enter-0.1.0` がAntigravityにインストール済み |

> [!IMPORTANT]
> Cursorでは `when` 句がWebview内のLexicalエディタに到達しなかったが、
> Antigravityには **`antigravity.isAgentModeInputBoxFocused`** というコンテキストキーが存在する。
> これを `when` 句に使えば、キーバインドレベルでEnterを横取りできる可能性が高い。

## User Review Required

> [!WARNING]
> **VS Codeキーバインド方式がAntigravityのWebviewでも効かない場合のフォールバック:**
> Karabiner-Elements（macOS）でアプリ単位のキーリマップ（Enter → Shift+Enter）を設定する案もある。
> まずはVS Code拡張方式で試し、ダメならKarabinerに切り替える方針でOK？

## Proposed Changes

### キーバインド設定

#### [MODIFY] [package.json](file:///Users/kimura512/dev/no-send-enter/package.json)

`keybindings` セクションを修正し、Antigravity固有のコンテキストキーを追加：

```diff
 "keybindings": [
   {
     "key": "enter",
     "command": "noSendEnter.newline",
-    "when": "config.noSendEnter.enabled",
+    "when": "config.noSendEnter.enabled && antigravity.isAgentModeInputBoxFocused",
     "priority": 100
   },
   {
     "key": "ctrl+enter",
     "mac": "cmd+enter",
     "command": "noSendEnter.send",
-    "when": "config.noSendEnter.enabled",
+    "when": "config.noSendEnter.enabled && antigravity.isAgentModeInputBoxFocused",
     "priority": 100
   }
 ]
```

> [!NOTE]
> `when` 句を `antigravity.isAgentModeInputBoxFocused` に限定することで、通常のエディタ操作に影響しない。

---

### コマンド実装

#### [MODIFY] [extension.ts](file:///Users/kimura512/dev/no-send-enter/src/extension.ts)

1. **newline コマンド**: 診断ログを通常モードに戻す（常時ログ→debug時のみ）
2. **send コマンド**: `antigravity.sendChatActionMessage` を送信候補に追加

```diff
 const commands = [
     'workbench.action.chat.submit',
     'aichat.sendMessage',
-    'composer.sendMessage',
+    'antigravity.sendChatActionMessage',
 ];
```

---

### ドキュメント更新

#### [MODIFY] [ARCHITECTURE.md](file:///Users/kimura512/dev/no-send-enter/ARCHITECTURE.md)

- when句コンテキスト対応表にAntigravity行を追加
- 「Webviewベースは非対応」の記述をAntigravity対応に修正

#### [MODIFY] [SPEC.md](file:///Users/kimura512/dev/no-send-enter/SPEC.md)

- サポート対象チャットに「Antigravity Agent Chat」を明記

---

### テスト更新

#### [MODIFY] [extension.test.ts](file:///Users/kimura512/dev/no-send-enter/src/extension.test.ts)

- send コマンドのテストで `antigravity.sendChatActionMessage` が呼ばれることを確認
- `composer.sendMessage` の呼び出しを `antigravity.sendChatActionMessage` に差し替え

---

## Verification Plan

### 自動テスト

```bash
pnpm test
```

既存のJestテスト13ケースが全パスすることを確認。send コマンドのテストケースを更新して `antigravity.sendChatActionMessage` が含まれることを検証。

### 手動検証（ユーザーに依頼）

1. **ビルド & インストール**
   ```bash
   pnpm run compile && pnpm run package
   ```
   生成された `.vsix` をAntigravityにインストール

2. **Antigravityのチャット入力欄で以下を確認：**
   - Enter → 改行が挿入される（メッセージ送信されない）
   - Cmd+Enter → メッセージが送信される
   - IME変換確定のEnter → 文字が確定されるだけ（改行も送信もしない）

3. **通常のコードエディタで以下を確認：**
   - Enter → 通常の改行（拡張の影響なし）
