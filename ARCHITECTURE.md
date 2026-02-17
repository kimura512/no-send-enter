# Architecture

## ファイル構成

```
no-send-enter/
├── package.json          # 拡張マニフェスト（コマンド・キーバインド・設定の宣言）
├── tsconfig.json         # TypeScript設定
├── jest.config.js        # Jestテスト設定
├── src/
│   ├── extension.ts      # 拡張エントリーポイント（28行）
│   ├── extension.test.ts # テスト（13ケース）
│   └── __mocks__/
│       └── vscode.ts     # vscodeモジュールのモック
└── out/                  # コンパイル済みJS（gitignore対象）
```

## キーバインド処理フロー

```mermaid
flowchart TD
    A[ユーザーがキーを押す] --> B{どのキー?}
    B -->|Enter| C{when句が一致?}
    B -->|Ctrl/Cmd+Enter| D{when句が一致?}
    B -->|その他| E[VS Code デフォルト動作]

    C -->|Yes| F{noSendEnter.enabled?}
    C -->|No| E
    D -->|Yes| G{noSendEnter.enabled?}
    D -->|No| E

    F -->|true| H[noSendEnter.newline]
    F -->|false| E
    G -->|true| I[noSendEnter.send]
    G -->|false| E

    H --> J["executeCommand('type', {text: '\\n'})"]
    I --> K["Promise.allSettled()"]
    K --> L[workbench.action.chat.send]
    K --> M[chat.action.submit]
```

## 二層の有効/無効チェック

```mermaid
flowchart LR
    subgraph Layer1["第1層: package.json keybindings"]
        W["when句に config.noSendEnter.enabled を含む"]
    end

    subgraph Layer2["第2層: extension.ts"]
        R["isEnabled() で設定値を再チェック"]
    end

    Layer1 -->|通過| Layer2 -->|通過| CMD[コマンド実行]
    Layer1 -->|不一致| DEF1[デフォルト動作]
    Layer2 -->|false| DEF2[何もしない]
```

- **第1層（宣言的）**: `package.json` の when 句で `config.noSendEnter.enabled` を条件指定。無効時はキーバインド自体が発火しない。
- **第2層（命令的）**: `extension.ts` 内の `isEnabled()` で動的に設定値を再チェック。安全ネットとして機能。

## 送信コマンドの解決

`noSendEnter.send` は複数のチャット実装に対応するため、`Promise.allSettled` で既知の送信コマンドを同時に発火する。対象コンテキストでないコマンドは no-op となる。

```mermaid
sequenceDiagram
    participant User
    participant Ext as extension.ts
    participant VS as VS Code API

    User->>Ext: Ctrl/Cmd+Enter
    Ext->>Ext: isEnabled() → true
    Ext->>VS: executeCommand('workbench.action.chat.send')
    Ext->>VS: executeCommand('chat.action.submit')
    Note right of VS: 該当コンテキストの<br/>コマンドのみ実行される
```

## when句コンテキスト対応表

| コンテキスト | 対象ツール | Enter → newline | Ctrl/Cmd+Enter → send |
|---|---|---|---|
| `inChatInput` | Copilot Chat | ✓ | ✓ |
| `interactiveEditorFocused` | インラインチャット | ✓ | ✓ |
| `cursorChatFocus` | Cursor AI Chat | ✓ | ✓ |
| `webviewFocus` | Antigravity等 | ✓ | ✓ |

## テスト戦略

- `vscode` モジュールを `src/__mocks__/vscode.ts` でモック
- Jest の `moduleNameMapper` でインポートを差し替え
- コマンド登録・呼び出し・設定チェックを単体テストでカバー（カバレッジ100%）
