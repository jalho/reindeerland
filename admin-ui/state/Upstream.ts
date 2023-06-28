/// <reference types="../../rcon-ws-proxy/admin-ui.d.ts" />

const HEADERNAME_USERNAME: TAuthHeader = "x-rcon-ws-proxy-username";
const HEADERNAME_PASSWORD: TAuthHeader = "x-rcon-ws-proxy-password";

/**
 * Credentials needed for connecting to upstream.
 */
export interface IConnectUpstreamCredentials {
  username: string;
  password: string;
}

class Upstream {
  private _loginUrl: URL;
  private _wsRconUrl: URL;
  /** `null` when not connected */
  private _socket: WebSocket | null = null;

  constructor(loginUrl: URL, wsRconUrl: URL) {
    this._loginUrl = loginUrl;
    this._wsRconUrl = wsRconUrl;
  }

  public async connect(credentials: IConnectUpstreamCredentials): Promise<WebSocket> {
    if (this._socket) return this._socket; // already connected

    // TODO: use Steam as IDP instead, don't do login in admin-ui at all
    let loginStatus: number | null = null;
    try {
      // upstream is expected to set auth cookies in response to this
      const response = await fetch(this._loginUrl, {
        method: "POST",
        headers: {
          [HEADERNAME_USERNAME]: credentials.username, // TODO: remove admin-ui login altogether; use Steam as IDP instead
          [HEADERNAME_PASSWORD]: credentials.password, // TODO: remove admin-ui login altogether; use Steam as IDP instead
        },
      });
      loginStatus = response.status;
    } catch (err_login) {
      // fetch resolves as soon as the server responds with headers
      // -- thus reject implies e.g. CORS preflight response didn't succeed or some networking error
      console.error(
        "Could not login via '%s'. Didn't get response headers. This could be due to e.g. missing CORS configuration or some networking error.",
        this._loginUrl
      );
    }

    const expectedStatus = 204;
    if (loginStatus !== expectedStatus) {
      console.error(
        "Expected login response status to be %d, instead got %d. Not proceeding to connect!",
        expectedStatus,
        loginStatus
      );
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
}

export default Upstream;
