import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// サーバの実体を作る
const server = new McpServer({
  name: "type-mcp",
  version: "0.1.0",
});

// ツールを登録する(足し算)
server.registerTool(
  "add",
  {
    title: "足し算",
    description: "2つの数値を足します",
    inputSchema: {
      a: z.number().describe("1つ目の数値"),
      b: z.number().describe("2つ目の数値"),
    },
  },
  async ({ a, b }) => {
    const result = a + b;
    return {
      content: [
        {
          type: "text",
          text: `${a} + ${b} = ${result}`,
        },
      ],
    };
  }
);

// stdio(標準入出力)で接続して待ち受ける
const transport = new StdioServerTransport();
await server.connect(transport);