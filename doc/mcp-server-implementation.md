# MCP サーバ実装方法(TypeScript)

## 前提知識

- MCP (Model Context Protocol) は VS Code とプロセスが stdio(標準入出力)で JSON-RPC 通信する仕組み
- サーバは「ツール」を提供し、Copilot Chat から呼び出される
- TypeScript は JavaScript にコンパイル(ビルド)してから実行する

## 実装手順

### 1. package.json の作成

```bash
npm init
```

**重要な設定**:
- `"type": "module"` を必ず追加(ESM を有効化)
- `"scripts"` に `"build": "tsc"` を追加

**必要な依存関係**:
- `@modelcontextprotocol/sdk` (dependencies)
- `zod` (dependencies)
- `typescript` (devDependencies)
- `@types/node` (devDependencies)

### 2. tsconfig.json の作成

```bash
npx tsc --init
```

**重要な設定**:
- `"module": "NodeNext"` (ESM の厳密ルールを有効化)
- `"moduleResolution": "NodeNext"` (上記とセット)
- `"target": "ES2022"`
- `"outDir": "./dist"` (コンパイル出力先)
- `"rootDir": "./src"` (ソースファイルの場所)
- `"strict": true` (型チェックを厳しく)

### 3. src/index.ts の実装

**基本構造**:
1. `McpServer` の import とインスタンス作成
2. `registerTool` でツールを登録(引数スキーマは zod で定義)
3. `StdioServerTransport` で stdio 接続

**重要なポイント**:
- import 時の拡張子は `.js` と書く(`.ts` ではない)
- ツールの処理関数は `async` を付ける(Promise を返すため)
- `console.log` は禁止(stdout はプロトコル専用)。ログは `console.error` を使う
- 最後の `await server.connect(transport)` はトップレベル await(ESM のみ可能)

### 4. ビルド

```bash
npm run build
```

`dist/index.js` が生成されればOK。

### 5. .vscode/mcp.json の作成

```json
{
  "servers": {
    "type-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/dist/index.js"]
    }
  }
}
```

**重要なポイント**:
- `${workspaceFolder}` は VS Code の変数(現在のワークスペースのパスに自動置換)
- `type` は `"stdio"` を指定

### 6. VS Code で起動

1. `.vscode/mcp.json` を開く
2. 「開始」ボタンをクリック
3. Copilot Chat のツール一覧に登録したツールが表示されることを確認

## TypeScript 特有のハマりどころ

| 問題 | 原因 | 解決方法 |
|------|------|---------|
| import エラー | 拡張子を `.ts` と書いた | `.js` と書く(コンパイル後のファイル名) |
| `await` エラー | `async` 関数の外で使った | 関数に `async` を付ける、またはトップレベル await を使う |
| 型エラー | zod スキーマと処理関数の引数が不一致 | `inputSchema` で定義したキーと分割代入の変数名を一致させる |
| ビルドエラー | `"type": "module"` がない | package.json に追加 |

## トラブルシューティング

### ツールが表示されない

- `dist/index.js` が存在するか確認
- `node dist/index.js` を手動実行してエラーが出ないか確認
- `.vscode/mcp.json` の JSON 構文が正しいか確認
- VS Code を再起動

### 起動してもすぐ終了する

- `console.log` を使っていないか確認(stdout は禁止)
- エラーログは出力パネル(Ctrl+Shift+U)の「MCP」を確認

### ビルドエラーが出る

- `npm install` を実行したか確認
- `node_modules/@modelcontextprotocol/sdk` が存在するか確認
- tsconfig.json の `module` と `moduleResolution` が `"NodeNext"` か確認

## 参考

- [Model Context Protocol 公式](https://modelcontextprotocol.io/)
- [@modelcontextprotocol/sdk (npm)](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [zod (npm)](https://www.npmjs.com/package/zod)
