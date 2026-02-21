# Cursor 向け改行ハック再挑戦プラン (DOM監視アプローチ)

いただいたHTML要素から、Cursorのチャット入力欄は Lexical ベースの `contenteditable` 要素であり、VS Code（Monaco Editor）の標準のキーバインディング機構（`package.json` の `when` 句）から完全に切り離された**独立したReact/DOMコンポーネント**として動いている可能性が極めて高いことがわかりました。

そのため、標準の VS Code Extension API によるキー横取りが効きません。

これを無理やり攻略するために、VS Code の拡張機能から UI の DOM に直接干渉する（またはハックする）アプローチをとるか、設定による回避策を探る必要があります。

## 検討されるアプローチ

### 案A: `vscode.window.onDidChangeActiveTextEditor` 等で強引にコマンドを送る（非推奨/不安定）
しかし対象が `contenteditable` なので TextEditor 扱いされておらず、これもおそらく空振りします。

### 案B: Cursor 側の設定ファイルで強引に上書きする（現実的）
Cursorの設定（`settings.json` や `keybindings.json`）で、`Enter` が押されたアクション自体を `cursor.action.insertNewLine` のような振る舞いに強制的に変えるスクリプトを生成・案内する。

### 案C: Webview または Custom Editor としてラップする（仕様上困難）
Cursor のチャットUI自体は既存のペインなので、拡張機能から直接 DOM (DOM Tree) にイベントリスナーを貼ること（`document.addEventListener`）は、**セキュリティ上の理由 (VS Code アーキテクチャ)** から不可能です。

## 今回の提案と次なる一手

VS Code の純粋な Extension API だけで Cursor の Lexical エディタ（DOM）の Enter キーを奪うことは**不可能**という結論に至りました。

唯一の解決策として、ユーザー（あなた）自身に **Cursor の `keybindings.json`** を直接ハックしてもらうのが最も確実です。

拡張機能側（`no-send-enter`）からこれを行うことはできないため、拡張機能の役割を「VS Code/Cursor 上での改行・送信コマンドを提供するだけの土台」とし、適用はユーザー自身の設定で行う形にします。

### プロジェクトとしての着地点（プラン）

1. `package.json` の `when` 句は、汎用性を持たせるため今の状態（先ほどビルドしたもの）を維持。
2. その代わり、Cursor で動かすための**「Cursor 専用 keybindings.json 究極のコピペ設定」**をドキュメント（README等）にまとめ、ユーザーがそれを自分の Cursor に貼り付けることで動作するようにする。

これで進めてよいでしょうか？（もしこれでもダメなら、Cursor がキーイベントを OS レベルに近いところで横取りしているため、外部拡張からの制御は完全に不可能です）
