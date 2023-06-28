/// <reference types="../../rcon-ws-proxy/admin-ui.d.ts" />

const HEADERNAME_USERNAME: TAuthHeader = "x-rcon-ws-proxy-username";
const HEADERNAME_PASSWORD: TAuthHeader = "x-rcon-ws-proxy-password";

class Upstream {
  private _url: URL;
  private _loginPath: string;
  private _wsPath: string;
  /** `null` when not connected */
  private _socket: WebSocket | null = null;

  constructor(url: URL, loginPath: string, wsPath: string) {
    this._url = url;
    this._loginPath = loginPath;
    this._wsPath = wsPath;
  }

  private async _connect(): Promise<WebSocket> {
    if (this._socket) return this._socket; // already connected

    await fetch(this._url.protocol + "//" + this._url.hostname + ":" + this._url.port + this._loginPath, {
      method: "POST",
      headers: {
        [HEADERNAME_USERNAME]: "foo", // TODO: get as user input
        [HEADERNAME_PASSWORD]: "bar", // TODO: get as user input
      },
    });

    const wsUrl = new URL(this._url);
    wsUrl.pathname = this._wsPath;
    const s = new WebSocket(this._url);
    return new Promise((resolve, reject) => {
      s.addEventListener("open", () => {
        this._socket = s;
        resolve(s);
      });
      s.addEventListener("error", reject);
    });
  }

  public async connect(): Promise<WebSocket> {
    return await this._connect();
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
    const socket = await this._connect();
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
