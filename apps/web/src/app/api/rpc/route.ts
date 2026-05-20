import { NextResponse } from "next/server";
import {
  forwardRpcCall,
  isInterceptedMethod,
  isPassthroughMethod,
} from "@/lib/rpc/client";

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: unknown[];
};

export async function POST(req: Request) {
  let body: JsonRpcRequest;
  try {
    body = (await req.json()) as JsonRpcRequest;
  } catch {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error" },
      },
      { status: 400 }
    );
  }

  const { method, params = [], id = null } = body;
  if (!method) {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32600, message: "Invalid Request" },
    });
  }

  if (isInterceptedMethod(method)) {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: {
        code: -32091,
        message: `Aegis intercepts ${method}. Use POST /api/preflight for screening.`,
        data: { method, intercepted: true },
      },
    });
  }

  if (!isPassthroughMethod(method)) {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: "Method not supported" },
    });
  }

  try {
    const result = await forwardRpcCall(method, params);
    return NextResponse.json({ jsonrpc: "2.0", id, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "RPC error";
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32603, message },
    });
  }
}
