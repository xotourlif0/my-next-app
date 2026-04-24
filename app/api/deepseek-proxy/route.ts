import "server-only";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 强制用 V4 Pro
    body.model = "deepseek-v4-pro";

    // Cursor 没有把 reasoning_content 回传给下一轮请求，
    // 这里补上 null，DeepSeek 就能接受
    if (body.messages) {
      body.messages = body.messages.map(
        (msg: Record<string, unknown>) => {
          if (msg.role === "assistant" && !msg.reasoning_content) {
            return { ...msg, reasoning_content: null };
          }
          return msg;
        },
      );
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Proxy error", details: String(error) },
      { status: 500 },
    );
  }
}
