import type { IncomingMessage, ServerResponse } from "node:http";
import stream from "node:stream";
import log4js from "log4js";
import type { WebSocketServer } from "ws";

const TOKEN_COOKIE_NAME = "token";
const SIG_COOKIE_NAME = "sig";

interface Token {}
interface Parsed {
  token: Token;
  signature: Buffer;
}

/**
 * Evaluate auth cookies.
 */
function evaluateAuthorization(logger: log4js.Logger, token: Token, signature: Buffer): boolean {
  logger.debug("Evaluating authorization", token, signature);
  // TODO
  return true;
}

/**
 * Parse auth cookies.
 */
function parseAuthorization(logger: log4js.Logger, request: IncomingMessage): Parsed | false {
  try {
    const cookies = request.headers.cookie?.split(";").map((c) => c.trim());
    if (!cookies) {
      logger.warn("Expected %s and %s cookies", TOKEN_COOKIE_NAME, SIG_COOKIE_NAME);
      return false;
    }
    const tokenCookie = cookies.find((c) => c.startsWith(TOKEN_COOKIE_NAME + "="));
    const sigCookie = cookies.find((c) => c.startsWith(SIG_COOKIE_NAME + "="));
    if (tokenCookie && sigCookie) {
      const token = tokenCookie.split("=")[1];
      const sig = sigCookie.split("=")[1];
      return {
        token: JSON.parse(Buffer.from(token, "base64").toString()),
        signature: Buffer.from(sig, "base64"),
      };
    } else {
      logger.warn("Missing %s and/or %s cookies", TOKEN_COOKIE_NAME, SIG_COOKIE_NAME);
      return false;
    }
  } catch (e) {
    logger.error("Error parsing authorization", e);
    return false;
  }
}

/**
 * Check auth cookies and upgrade connection if OK.
 */
const handleUpgrade =
  (logger: log4js.Logger, wsServer: WebSocketServer) =>
  (request: IncomingMessage, socket: stream.Duplex, head: Buffer) => {
    socket.on("error", logger.error);
    const authPayload = parseAuthorization(logger, request);
    if (authPayload && evaluateAuthorization(logger, authPayload.token, authPayload.signature)) {
      logger.info("Authorized connection; upgrading connection");
      socket.removeListener("error", logger.error);
      wsServer.handleUpgrade(request, socket, head, function done(ws) {
        wsServer.emit("connection", ws);
      });
    } else {
      logger.warn("Unauthorized upgrade attempt");
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }
  };

/**
 * Check request parameters and set auth cookies if OK.
 */
function handleLogin(logger: log4js.Logger, req: IncomingMessage, res: ServerResponse) {
  logger.debug("Handling login request");
  // TODO: check request credentials against some persistent store, conditionally set cookies
  res.setHeader("Set-Cookie", [`${TOKEN_COOKIE_NAME}=foo; HttpOnly`, `${SIG_COOKIE_NAME}=bar; HttpOnly`]);
  res.end();
}

export { handleUpgrade, handleLogin };
