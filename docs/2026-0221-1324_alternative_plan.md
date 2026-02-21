# Cursor 向け改行ハック再挑戦プラン (DOM監視アプローチ)

いただいたHTML要素から、Cursorのチャット入力欄は Lexical ベースの `contenteditable` 要素であり、VS Code（Monaco Editor）の標準のキーバインディング機構（`package.json` の `when` 句）から完全に切り離された**独立したReact/DOMコンポーネント**として動いている可能性が極めて高いことがわかりました。

そのため、標準の VS Code Extension API によるキー横取りが効きません。

これを無理やり攻略するために、VS Code の拡張機能から UI の DOM に直接干渉する（またはハックする）アプローチをとるか、設定による回避策を探る必要があります。

## 検討されるアプローチ

### 案A: `vscode.window.onDidChangeActiveTextEditor` 等で強引にコマンドを送る（非推奨/不安定）
しかし対象が `contenteditable` なので TextEditor 扱いされておらず、これもおそらく空振りします。

### 案B: Cursor 側の設定ファイルで強引に上書きする（現実的だが現状失敗）
Cursorの設定（`settings.json` や `keybindings.json`）で、`Enter` が押されたアクション自体を `cursor.action.insertNewLine` のような振る舞いに強制的に変えるスクリプトを生成・案内する。
**結果:** ユーザー自身の `keybindings.json` に直接設定を書き込みましたが、Cursor が `when` 句を認識せず失敗しました。

### 案C: コンテキストキーの完全特定（現在の目標）
Cursor のログから、`debug.getContextKeyValue` というデバッグコマンドが存在することが判明しました。これを利用し、チャット入力欄にフォーカスが当たっている瞬間の「真の」コンテキストキーを特定します。

## 今回の提案と次なる一手

ユーザーに以下の操作を依頼し、現在のコンテキストキーのダンプを取得します。

1. Cursor のチャット入力欄にフォーカスを当てる。
2. コマンドパレットから `Developer: Inspect Context Keys` または関連コマンドを実行する。
3. エラーが出たログの `debug.getContextKeyValue` などを利用して状態を探る。
