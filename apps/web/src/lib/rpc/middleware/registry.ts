import { aegisPreflightMiddleware } from "./aegisPreflight";
import { aegisPreflightUserOpMiddleware } from "./aegisPreflightUserOp";
import { aegisSendMiddleware } from "./aegisSend";
import { interceptSendMiddleware } from "./interceptSend";
import { metricsMiddleware } from "./metrics";
import { passthroughMiddleware } from "./passthrough";
import { rawTxInlineMiddleware } from "./rawTxInline";
import type { RpcMiddleware } from "./types";

export type RegisteredMiddleware = {
  name: string;
  handler: RpcMiddleware;
};

export const rpcMiddlewareStack: RegisteredMiddleware[] = [
  { name: "metrics", handler: metricsMiddleware },
  { name: "aegis_preflight", handler: aegisPreflightMiddleware },
  { name: "aegis_preflightUserOp", handler: aegisPreflightUserOpMiddleware },
  { name: "aegis_sendTransaction", handler: aegisSendMiddleware },
  { name: "rawTx_inline", handler: rawTxInlineMiddleware },
  { name: "intercept_send", handler: interceptSendMiddleware },
  { name: "passthrough", handler: passthroughMiddleware },
];

export function getMiddlewareHandlers(): RpcMiddleware[] {
  return rpcMiddlewareStack.map((m) => m.handler);
}
