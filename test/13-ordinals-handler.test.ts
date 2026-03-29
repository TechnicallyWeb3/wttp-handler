import { expect } from "chai";
import { WTTPHandler } from "../src/handler";

describe("Ordinals gateway fetch", function () {
    let originalFetch: typeof fetch;
    let lastUrl: string | undefined;

    beforeEach(function () {
        originalFetch = globalThis.fetch;
        lastUrl = undefined;
        globalThis.fetch = (async (
            input: string | URL
        ): Promise<Response> => {
            lastUrl = typeof input === "string" ? input : input.href;
            return new Response("ok", { status: 200 });
        }) as typeof fetch;
    });

    afterEach(function () {
        globalThis.fetch = originalFetch;
    });

    const sampleTxid = "6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799";

    it("resolves txid:index to default gateway URL with i-separator", async function () {
        const wttp = new WTTPHandler();
        await wttp.fetch(`ord://${sampleTxid}:0`);
        expect(lastUrl).to.equal(
            `https://ordinals.com/content/${sampleTxid}i0`
        );
    });

    it("appends encoded path segments", async function () {
        const wttp = new WTTPHandler();
        await wttp.fetch(`ord://${sampleTxid}:0/my file.png`);
        expect(lastUrl).to.equal(
            `https://ordinals.com/content/${sampleTxid}i0/${encodeURIComponent("my file.png")}`
        );
    });

    it("handles multi-segment path", async function () {
        const wttp = new WTTPHandler();
        await wttp.fetch(`ord://${sampleTxid}:2/folder/image.png`);
        expect(lastUrl).to.equal(
            `https://ordinals.com/content/${sampleTxid}i2/folder/image.png`
        );
    });

    it("uses ordinalsGateway from fetch options", async function () {
        const wttp = new WTTPHandler();
        await wttp.fetch(`ord://${sampleTxid}:0`, {
            ordinalsGateway: "https://custom.example/content/",
        });
        expect(lastUrl).to.equal(
            `https://custom.example/content/${sampleTxid}i0`
        );
    });

    it("uses constructor ordinalsGateway default", async function () {
        const wttp = new WTTPHandler(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            "https://gw.test/content/"
        );
        await wttp.fetch(`ord://${sampleTxid}:1`);
        expect(lastUrl).to.equal(`https://gw.test/content/${sampleTxid}i1`);
    });

    it("normalizes gateway without trailing slash", async function () {
        const wttp = new WTTPHandler();
        await wttp.fetch(`ord://${sampleTxid}:0`, {
            ordinalsGateway: "https://custom.example/content",
        });
        expect(lastUrl).to.equal(
            `https://custom.example/content/${sampleTxid}i0`
        );
    });

    it("throws on invalid URI (non-hex txid)", async function () {
        const wttp = new WTTPHandler();
        let threw = false;
        try {
            await wttp.fetch("ord://notahex:0");
        } catch (e) {
            threw = true;
            expect((e as Error).message).to.include("Invalid Ordinals URI");
        }
        expect(threw).to.be.true;
    });

    it("throws on missing inscription index", async function () {
        const wttp = new WTTPHandler();
        let threw = false;
        try {
            await wttp.fetch("ord://abc123");
        } catch (e) {
            threw = true;
            expect((e as Error).message).to.include("Invalid Ordinals URI");
        }
        expect(threw).to.be.true;
    });
});
