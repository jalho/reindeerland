import type { IncomingMessage, ServerResponse } from "node:http";
import crypto from "node:crypto";
import stream from "node:stream";
import log4js from "log4js";
import type { WebSocketServer, WebSocket } from "ws";
import { IStore } from "../stores/_Store.js";
import { IUser } from "../stores/Users.js";

const TOKEN_COOKIE_NAME = "token";
const SIG_COOKIE_NAME = "sig";
const SECRET_ENV_VAR_PASSWORD_HASH = "SECRET_PASSWORD_HASH";
const SECRET_ENV_VAR_TOKEN_SIGNING = "SECRET_TOKEN_SIGNING";
const HMAC_ALGORITHM = "sha512";
const HEADERNAME_USERNAME: TAuthHeader = "x-rcon-ws-proxy-username";
const HEADERNAME_PASSWORD: TAuthHeader = "x-rcon-ws-proxy-password";

interface Token {
  username: string;
}
interface Parsed {
  token: Token;
  signature: Buffer;
}

function getSecret(type: "password hashing" | "token signing"): Buffer {
  if (type === "password hashing") {
    if (process.env[SECRET_ENV_VAR_PASSWORD_HASH]) {
      return Buffer.from(process.env[SECRET_ENV_VAR_PASSWORD_HASH], "base64");
    } else throw new Error(`Environment variable ${SECRET_ENV_VAR_PASSWORD_HASH} not set`);
  } else {
    if (process.env[SECRET_ENV_VAR_TOKEN_SIGNING]) {
      return Buffer.from(process.env[SECRET_ENV_VAR_TOKEN_SIGNING], "base64");
    } else throw new Error(`Environment variable ${SECRET_ENV_VAR_TOKEN_SIGNING} not set`);
  }
}

/**
 * Check togen signature.
 */
function checkSignature(logger: log4js.Logger, token: Token, actualSig: Buffer): boolean {
  const token_base64 = Buffer.from(JSON.stringify(token)).toString("base64");
  const expectedSig = hash(token_base64, getSecret("token signing"));
  let sigIsLegit = false;
  try {
    // crypto.timingSafeEqual throws at least when compared buffs have different length
    sigIsLegit = crypto.timingSafeEqual(actualSig, expectedSig);
  } catch (err_sig_buff_check) {
    sigIsLegit = false;
  }
  if (!sigIsLegit) logger.warn("Got incorrect signature with token");
  else logger.info("Token signature is OK -- token: %o", token);
  return sigIsLegit;
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
      const token = tokenCookie.substring((TOKEN_COOKIE_NAME + "=").length);
      const sig = sigCookie.substring((SIG_COOKIE_NAME + "=").length);
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

export interface IAuthorizedConnection {
  downstream: WebSocket;
  token: Token;
}

/**
 * Check auth cookies and upgrade connection if OK.
 */
const handleUpgrade =
  (logger: log4js.Logger, wsServer: WebSocketServer) =>
  (request: IncomingMessage, socket: stream.Duplex, head: Buffer) => {
    socket.on("error", logger.error);
    const authPayload = parseAuthorization(logger, request);
    if (authPayload && checkSignature(logger, authPayload.token, authPayload.signature)) {
      logger.info("Authorized connection; upgrading connection");
      socket.removeListener("error", logger.error);
      wsServer.handleUpgrade(request, socket, head, function done(downstream) {
        const authorizedConnection: IAuthorizedConnection = {
          downstream,
          token: authPayload.token,
        };
        wsServer.emit("connection", authorizedConnection);
      });
    } else {
      logger.warn("Unauthorized upgrade attempt");
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }
  };

function hash(item: string, key: Buffer): Buffer {
  return crypto.createHmac(HMAC_ALGORITHM, key).update(item).digest();
}

/**
 * Match given password against stored hash.
 */
async function matchPassword(
  username: string,
  password: string,
  store: IStore<IUser>,
  logger: log4js.Logger
): Promise<IUser | null> {
  const user = await store.findOne({ id: username });
  if (!user) {
    logger.warn("User %s not found", username);
    return null;
  }
  const hashIn = hash(password, getSecret("password hashing"));
  if (crypto.timingSafeEqual(user.passwordHash, hashIn)) return user;
  else return null;
}

/**
 * Check request parameters and set auth cookies if OK.
 */
async function handleLogin(logger: log4js.Logger, req: IncomingMessage, res: ServerResponse, store: IStore<IUser>) {
  logger.debug("Handling login request");
  const username = req.headers[HEADERNAME_USERNAME];
  const password = req.headers[HEADERNAME_PASSWORD];
  if (!username || !password || Array.isArray(username) || Array.isArray(password)) {
    logger.warn(
      "Missing or invalid username or password, expected headers %s and %s",
      HEADERNAME_USERNAME,
      HEADERNAME_PASSWORD
    );
    res.statusCode = 400;
    res.end();
    return;
  }
  const user = await matchPassword(username, password, store, logger);
  if (user) {
    logger.info("Login successful: %s", user.id);
    const token: Token = { username: user.id };
    const token_base64 = Buffer.from(JSON.stringify(token)).toString("base64");
    const sigSecret = getSecret("token signing");
    const sig = hash(token_base64, sigSecret);
    const sig_base64 = sig.toString("base64");
    res.statusCode = 204;
    res.setHeader("Set-Cookie", [
      `${TOKEN_COOKIE_NAME}=${token_base64}; HttpOnly`,
      `${SIG_COOKIE_NAME}=${sig_base64}; HttpOnly`,
    ]);
    res.end();
  } else {
    logger.warn("Invalid username or password");
    res.statusCode = 401;
    res.end();
  }
}

export { handleUpgrade, handleLogin, hash, getSecret };
