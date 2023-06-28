/// <reference types="../../rcon-ws-proxy/admin-ui.d.ts" />

const HEADERNAME_USERNAME: TAuthHeader = "x-rcon-ws-proxy-username";
const HEADERNAME_PASSWORD: TAuthHeader = "x-rcon-ws-proxy-password";

class Upstream {
  private _loginUrl: URL;
  private _wsRconUrl: URL;
  /** `null` when not connected */
  private _socket: WebSocket | null = null;

  constructor(loginUrl: URL, wsRconUrl: URL) {
    this._loginUrl = loginUrl;
    this._wsRconUrl = wsRconUrl;
  }

  public async connect(): Promise<WebSocket> {
    if (this._socket) return this._socket; // already connected

    // TODO: use Steam as IDP instead, don't do login in admin-ui at all
    let loginStatus: number | null = null;
    try {
      // upstream is expected to set auth cookies in response to this
      const response = await fetch(this._loginUrl, {
        method: "POST",
        headers: {
          [HEADERNAME_USERNAME]: "foo", // TODO: remove admin-ui login altogether; use Steam as IDP instead
          [HEADERNAME_PASSWORD]: "bar", // TODO: remove admin-ui login altogether; use Steam as IDP instead
        },
      });
      loginStatus = response.status;
    } catch (err_login) {
      // fetch resolves as soon as the server responds with headers
      // -- thus reject implies e.g. CORS preflight response didn't succeed or some networking error
      console.error("Could not login via '%s'. Didn't get response headers. This could be due to e.g. missing CORS configuration or some networking error.", this._loginUrl);
    }

    const expectedStatus = 204;
    if (loginStatus !== expectedStatus) {
      console.error("Expected login response status to be %d, instead got %d. Not proceeding to connect!", expectedStatus, loginStatus);
      throw new Error("Could not login!");
    }

    const s = new WebSocket(this._wsRconUrl);
    return new Promise((resolve, reject) => {
      s.addEventListener("open", () => {
        this._socket = s;
        resolve(s);
      });
      s.addEventListener("error", reject);
    });
  }

  /**
   * Send a message to the upstream and wait for a response.
   *
   * @param message Message to send
   * @param id ID used to identify the response to the message sent
   * @returns Data of the message event that was received as a response to the
   *          message sent, or `null` if no response was received for whatever
   *          reason.
   */
  public async send<T extends { id: string }>(message: T): Promise<Record<string, unknown> | null> {
    const socket = await this.connect();
    socket.send(JSON.stringify(message));
    return new Promise((resolve) => {
      socket.addEventListener("message", (event) => {
        let json: Record<string, unknown>;
        try {
          const parsed = JSON.parse(event.data);
          if (typeof parsed === "object" && parsed !== null) {
            json = parsed;
          } else {
            throw new Error(`Expected upstream data be a JSON object, got "${typeof parsed}"`);
          }
          if (!("id" in json))
            throw new Error(
              `Expected upstream data to have "id" property, got only ${Object.keys(json)
                .map((k) => `"${k}"`)
                .join(", ")}`
            );
          if (!("payload" in json))
            throw new Error(
              `Expected upstream data to have "payload" property, got only ${Object.keys(json)
                .map((k) => `"${k}"`)
                .join(", ")}`
            );
        } catch (error) {
          console.error("Got a message in invalid format!", error.message);
          return resolve(null);
        }

        if (json.id !== message.id) {
          const error = new Error(`Expected event.data.id to be "${message.id}", got "${json.id}"`);
          console.error(error.message);
          return resolve(null);
        }

        return resolve(json);
      });

      socket.addEventListener("error", (error) => {
        console.error("WebSocket error:", error);
        return resolve(null);
      });
    });
  }
}

export default Upstream;
