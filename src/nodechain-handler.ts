/**
 * NodeChain WTTP Handler
 *
 * Adapts the NodeChain REST API to the same interface as WTTPHandler from
 * the wttp-handler package, so NodeChain sites can be accessed with the
 * same fetch-like API used for Ethereum-hosted WTTP sites.
 *
 * URL format:  wttp://<siteAddress>:nodechain/<path>
 * Example:     wttp://NCSabc123xyz:nodechain/index.html
 *
 * Files to add/change in wttp-handler to complete integration:
 *   1. src/nodechain-handler.ts  ← this file
 *   2. src/handler.ts            ← add "nodechain": 99999 in getChainId()
 *   3. src/index.ts              ← add: export * from "./nodechain-handler"
 */

export type NodeChainMethod = "GET" | "HEAD" | "OPTIONS" | "LOCATE";

export interface NodeChainFetchOptions {
  method?: NodeChainMethod;
  redirect?: "follow" | "error" | "manual";
}

/** Shape of /api/sites/:address metadata response */
interface SiteMetaFile {
  path: string;
  mimeType: string;
  blockIndex: number;
  txId: string;
  status: "confirmed" | "pending";
}

interface SiteMetaResponse {
  address: string;
  files: SiteMetaFile[];
  fileCount: number;
}

const MAX_REDIRECTS = 30;

/**
 * Parses a wttp:// URL into its parts.
 *
 * Because the standard URL class treats the alias ("nodechain") as a port
 * and rejects it, we parse manually.
 *
 * Accepts:
 *   wttp://NCSabc123:nodechain/index.html
 *   wttp://NCSabc123/index.html            (no alias — still valid)
 */
function parseWttpUrl(raw: string): { siteAddress: string; alias: string | null; pathname: string } {
  const str = raw.trim();

  // Strip protocol
  const withoutProto = str.replace(/^wttp:\/\//i, "");

  // Split off path: everything after the first "/"
  const slashIdx = withoutProto.indexOf("/");
  const hostPart = slashIdx === -1 ? withoutProto : withoutProto.slice(0, slashIdx);
  const pathname = slashIdx === -1 ? "/" : withoutProto.slice(slashIdx);

  // Split host:alias
  const colonIdx = hostPart.indexOf(":");
  const siteAddress = colonIdx === -1 ? hostPart : hostPart.slice(0, colonIdx);
  const alias = colonIdx === -1 ? null : hostPart.slice(colonIdx + 1);

  return { siteAddress, alias, pathname };
}

/**
 * The chain alias registered in wttp-handler's getChainId().
 * Add this entry there:  "nodechain": 99999
 */
export const NODECHAIN_CHAIN_ID = 99999;
export const NODECHAIN_ALIAS = "nodechain";

/**
 * NodeChainHandler — drop-in replacement for WTTPHandler when targeting NodeChain sites.
 *
 * @param nodeBase  Base URL of your NodeChain API server.
 *                  Defaults to the current origin so it works in browsers.
 *                  Example: "https://your-node.replit.app"
 */
export class NodeChainHandler {
  private nodeBase: string;

  constructor(nodeBase?: string) {
    if (nodeBase) {
      this.nodeBase = nodeBase.replace(/\/$/, "");
    } else if (typeof window !== "undefined") {
      this.nodeBase = window.location.origin;
    } else {
      this.nodeBase = "http://localhost:80";
    }
  }

  /**
   * Fetch a resource from a NodeChain WTTP site.
   *
   * Returns a standard Response object — the same type as window.fetch().
   */
  public async fetch(url: string, options?: NodeChainFetchOptions): Promise<Response> {
    return this._fetch(url, options, []);
  }

  private async _fetch(
    url: string,
    options: NodeChainFetchOptions = {},
    visited: string[]
  ): Promise<Response> {
    const method = options.method ?? "GET";
    const redirect = options.redirect ?? "follow";

    const { siteAddress, alias, pathname } = parseWttpUrl(url);

    if (!siteAddress) {
      return this.errorResponse(400, "Invalid WTTP URL — no site address found");
    }

    // Only handle "nodechain" or no alias; reject real EVM chain IDs
    if (alias && alias !== NODECHAIN_ALIAS && !/^\d+$/.test(alias)) {
      return this.errorResponse(400, `Unknown chain alias: ${alias}. Use "nodechain" for NodeChain sites.`);
    }
    if (alias && alias !== NODECHAIN_ALIAS && /^\d+$/.test(alias)) {
      const chainId = parseInt(alias, 10);
      if (chainId !== NODECHAIN_CHAIN_ID) {
        return this.errorResponse(400, `Chain ID ${chainId} is not NodeChain (expected ${NODECHAIN_CHAIN_ID}). Use the wttp-handler WTTPHandler for EVM chains.`);
      }
    }

    switch (method) {
      case "OPTIONS":
        return this.handleOptions(siteAddress, pathname);
      case "HEAD":
        return this.handleHead(siteAddress, pathname);
      case "LOCATE":
        return this.handleLocate(siteAddress, pathname);
      case "GET":
      default:
        return this.handleGet(siteAddress, pathname, redirect, url, visited, options);
    }
  }

  // ---------------------------------------------------------------------------
  // Method handlers
  // ---------------------------------------------------------------------------

  private async handleGet(
    siteAddress: string,
    pathname: string,
    redirect: string,
    originalUrl: string,
    visited: string[],
    options: NodeChainFetchOptions
  ): Promise<Response> {
    const apiUrl = `${this.nodeBase}/api/sites/${siteAddress}/content${pathname}`;

    let upstream: Response;
    try {
      upstream = await globalThis.fetch(apiUrl);
    } catch (err) {
      return this.errorResponse(502, `NodeChain node unreachable: ${err instanceof Error ? err.message : String(err)}`);
    }

    if (upstream.status === 404) {
      return this.errorResponse(404, `File not found on NodeChain: ${pathname}`);
    }

    if (!upstream.ok) {
      return this.errorResponse(upstream.status, `NodeChain gateway error: ${upstream.statusText}`);
    }

    // Pass through all headers from the NodeChain API, plus our extras
    const headers = new Headers();
    upstream.headers.forEach((value, key) => headers.set(key, value));
    headers.set("X-WTTP-Chain", "nodechain");
    headers.set("X-WTTP-Protocol", "NodeChain/1.0");

    const body = await upstream.arrayBuffer();

    // Handle redirect via Location header if the file contains a redirect
    const location = headers.get("Location");
    if (location && this.isRedirect(upstream.status)) {
      if (redirect === "error") {
        return this.errorResponse(302, `Redirect to ${location}`);
      }
      if (redirect === "manual") {
        return new Response(null, { status: upstream.status, headers });
      }
      // redirect === "follow"
      if (visited.includes(originalUrl)) {
        return this.errorResponse(508, `Loop detected: ${visited.join(" → ")}`);
      }
      if (visited.length >= MAX_REDIRECTS) {
        return this.errorResponse(310, "Too many redirects");
      }
      return this._fetch(location, options, [...visited, originalUrl]);
    }

    return new Response(body, { status: upstream.status, headers });
  }

  private async handleHead(siteAddress: string, pathname: string): Promise<Response> {
    // Use the site metadata endpoint to build HEAD headers without downloading body
    const metaUrl = `${this.nodeBase}/api/sites/${siteAddress}`;
    let meta: SiteMetaResponse;

    try {
      const r = await globalThis.fetch(metaUrl);
      if (!r.ok) return this.errorResponse(r.status, `Site not found: ${siteAddress}`);
      meta = (await r.json()) as SiteMetaResponse;
    } catch {
      return this.errorResponse(502, "NodeChain node unreachable");
    }

    const file = meta.files.find((f) => f.path === pathname || f.path === pathname.replace(/\/$/, "/index.html"));
    if (!file) {
      return this.errorResponse(404, `File not found: ${pathname}`);
    }

    const headers = new Headers({
      "Content-Type": file.mimeType,
      "ETag": file.txId,
      "X-NodeChain-TxId": file.txId,
      "X-NodeChain-Block": file.blockIndex === -1 ? "pending" : String(file.blockIndex),
      "X-NodeChain-Status": file.status,
      "X-WTTP-Chain": "nodechain",
      "X-WTTP-Protocol": "NodeChain/1.0",
    });

    return new Response(null, { status: 200, headers });
  }

  private async handleLocate(siteAddress: string, pathname: string): Promise<Response> {
    // NodeChain stores each file as a single transaction (one chunk).
    // LOCATE returns where the data chunks live — for NodeChain that's
    // always "1 chunk = the transaction ID".
    const metaUrl = `${this.nodeBase}/api/sites/${siteAddress}`;
    let meta: SiteMetaResponse;

    try {
      const r = await globalThis.fetch(metaUrl);
      if (!r.ok) return this.errorResponse(r.status, `Site not found: ${siteAddress}`);
      meta = (await r.json()) as SiteMetaResponse;
    } catch {
      return this.errorResponse(502, "NodeChain node unreachable");
    }

    const file = meta.files.find((f) => f.path === pathname);
    if (!file) {
      return this.errorResponse(404, `File not found: ${pathname}`);
    }

    // Describe the single storage chunk as a structure (mirrors @wttp/core LOCATE shape)
    const structure = {
      chunkCount: 1,
      chunks: [
        {
          index: 0,
          txId: file.txId,
          blockIndex: file.blockIndex,
          chain: "nodechain",
          status: file.status,
        },
      ],
    };

    const headers = new Headers({
      "Content-Type": "application/json",
      "ETag": file.txId,
      "X-WTTP-Chain": "nodechain",
      "X-WTTP-Protocol": "NodeChain/1.0",
    });

    return new Response(JSON.stringify(structure), { status: 200, headers });
  }

  private handleOptions(siteAddress: string, _pathname: string): Response {
    // NodeChain sites are read-only from outside (no PUT/DELETE via the handler).
    // Write access goes through the Deploy page on the NodeChain UI.
    const headers = new Headers({
      "Allow": "GET, HEAD, OPTIONS, LOCATE",
      "X-WTTP-Chain": "nodechain",
      "X-WTTP-Protocol": "NodeChain/1.0",
      "X-NodeChain-Site": siteAddress,
    });
    return new Response(null, { status: 204, headers });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private errorResponse(status: number, message: string): Response {
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  private isRedirect(status: number): boolean {
    return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
  }

  /**
   * Convenience: list all sites deployed on this NodeChain node.
   */
  public async listSites(): Promise<{ address: string; fileCount: number; status: string }[]> {
    const r = await globalThis.fetch(`${this.nodeBase}/api/sites`);
    if (!r.ok) throw new Error(`Failed to list sites: ${r.statusText}`);
    const data = (await r.json()) as { sites: { address: string; fileCount: number; status: string }[] };
    return data.sites;
  }

  /**
   * Convenience: get file list for a specific site.
   */
  public async getSiteFiles(siteAddress: string): Promise<SiteMetaResponse> {
    const r = await globalThis.fetch(`${this.nodeBase}/api/sites/${siteAddress}`);
    if (!r.ok) throw new Error(`Site not found: ${siteAddress}`);
    return r.json() as Promise<SiteMetaResponse>;
  }
}
