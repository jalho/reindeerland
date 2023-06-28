import http from "node:http";
import Users from "../stores/Users.js";
import log4js from "log4js";
import { getSecret, hash } from "./auth.js";

async function handlePrivateAdminRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  store: Users,
  logger: log4js.Logger
): Promise<void> {
  const username = req.headers["username"];
  const password = req.headers["password"];
  if (typeof username !== "string" || typeof password !== "string" || username.length === 0 || password.length === 0) {
    logger.warn("Expected username and password in headers");
    res.statusCode = 400;
    res.end();
    return;
  }

  const hashingSecret = getSecret("password hashing");
  const hashedPassword = hash(password, hashingSecret);
  await store.save({ id: username, passwordHash: hashedPassword });
  logger.info("User %s created", username);

  res.end();
}

export default handlePrivateAdminRequest;
