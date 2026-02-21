拡張機能名

No-Send-Enter

概要

VS Code（およびその派生エディタ）内の複数のAIチャット入力欄において、デフォルトの送信挙動を抑制し、「Enterで改行、Ctrl/Cmd+Enterで送信」に変更する。OSS。
ユーザーが自身の好みに合わせて、送信および改行の挙動をコントロールできるようにする。

対象環境

Visual Studio Code / Cursor / 各種AIチャット拡張機能
開発言語: TypeScript

サポート対象チャット

1. GitHub Copilot Chat (サイドバー)
2. Antigravity Agent Chat (サイドパネル) ← メインターゲット
3. Cursor AI Chat (Cursor Editor内蔵チャット)
   	※ 各ツールの when 句コンテキストを調査し、網羅的に適用する。

具体的機能

1. Enterキーの無効化（送信防止）
   
   	チャット入力欄がフォーカスされている際、Enterキー単体での送信アクションをトラップし、代わりに改行（type command: \n）を実行する。
2. Ctrl+Enter (Win) / Cmd+Enter (Mac) による送信
   
   	標準の送信コマンド（workbench.action.chat.send 等）をこれらのコンボに割り当てる。
3. OS間互換性
   
   	package.json の keybindings において win および mac プロパティを個別に定義し、どちらの環境でも直感的に動作するようにする。
4. カスタマイズ性と設定
- 機能のグローバルON/OFFを settings.json から切り替え可能にする。
- 将来的には、ユーザーがショートカットキー設定画面から自由にキーを変更できるよう、本拡張機能独自のコマンド（例: stopEnterSend.send, stopEnterSend.newline）を公開する。

技術的要件

1. キーバインド設定 (package.json)
   
   	以下のコンテキストを含む when 句を組み合わせて定義する：
- inChatInput (Copilot用)
- interactiveEditorFocused (インライン用)
- cursorChatFocus (Cursor特有のコンテキストを想定)
- webviewFocus (Antigravity等のWebviewベース用)
2. 設定項目 (configuration)
{

"stopEnterSend.enabled": {

"type": "boolean",

"default": true,

"description": "Enable/Disable the Enter-to-newline swap logic."

}

}

3. 依存関係
   
   	VS Code API の最新バージョンをターゲットとし、主要なAI拡張機能のアップデートに追従できる構成にする。

構成ファイル案

1. package.json (キーバインドと設定の定義)
2. src/extension.ts (設定に応じた挙動の制御、コマンド登録)
3. README.md (各AIツールごとの設定方法や注意点の解説)
