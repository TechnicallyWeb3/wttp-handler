import { expect } from "chai";
import { WTTPHandler } from "../src/handler";

describe("IPFS gateway fetch", function () {
    let originalFetch: typeof fetch;
    let lastUrl: string | undefined;

    beforeEach(function () {
        originalFetch = globalThis.fetch;
        lastUrl = undefined;
        globalThis.fetch = (async (
            input: string | URL
        ): Promise<Response> => {
            lastUrl =
                typeof input === "string"
                    ? input
                    : input.href;
            return new Response("ok", { status: 200 });
        }) as typeof fetch;
    });

    afterEach(function () {
        globalThis.fetch = originalFetch;
    });

    it("resolves cid-only ipfs:// to default gateway URL", async function () {
        const wttp = new WTTPHandler();
        const cid = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
        await wttp.fetch(`ipfs://${cid}`);
        expect(lastUrl).to.equal(`https://ipfs.io/ipfs/${cid}`);
    });

    it("appends encoded path segments", async function () {
        const wttp = new WTTPHandler();
        const cid = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
        await wttp.fetch(`ipfs://${cid}/my file.txt`);
        expect(lastUrl).to.equal(
            `https://ipfs.io/ipfs/${cid}/${encodeURIComponent("my file.txt")}`
        );
    });

    it("uses ipfsGateway from fetch options", async function () {
        const wttp = new WTTPHandler();
        await wttp.fetch("ipfs://QmX", {
            ipfsGateway: "https://custom.example/ipfs/",
        });
        expect(lastUrl).to.equal("https://custom.example/ipfs/QmX");
    });

    it("uses constructor ipfsGateway default", async function () {
        const wttp = new WTTPHandler(
            undefined,
            undefined,
            undefined,
            undefined,
            "https://gw.test/ipfs/"
        );
        await wttp.fetch("ipfs://QmY");
        expect(lastUrl).to.equal("https://gw.test/ipfs/QmY");
    });

    it("normalizes gateway without trailing slash", async function () {
        const wttp = new WTTPHandler();
        await wttp.fetch("ipfs://QmZ", {
            ipfsGateway: "https://custom.example/ipfs",
        });
        expect(lastUrl).to.equal("https://custom.example/ipfs/QmZ");
    });
});
