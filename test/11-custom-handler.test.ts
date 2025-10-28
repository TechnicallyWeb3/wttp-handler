import { expect } from "chai";
import { WTTPHandler, WTTPFetchOptions } from "../src/handler";
import dotenv from "dotenv";
dotenv.config();

interface CustomHandlerTest {
    name: string;
    handler: WTTPHandler;
    tests: CustomHandlerTestCase[];
}
interface CustomHandlerTestCase {
    name: string;
    url: string;
    expectedStatus: number;
    timeout?: number;
}

describe("Custom Handler Tests", function() {
    const customHandlerTests: CustomHandlerTest[] = [
        {
            name: "default tests",
            handler: new WTTPHandler(),
            tests: [
                {
                    name: "default test",
                    url: "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:11155111/index.html",
                    expectedStatus: 200,
                }
            ]

        },
        {
            name: "custom rpc tests",
            handler: new WTTPHandler(undefined, undefined, process.env.POLYGON_RPC_URL || undefined),
            tests: [
                {
                    name: "custom handler test",
                    url: "wttp://mancino.eth/index.html",
                    expectedStatus: 200,
                    timeout: 30000,
                }
            ]
        }
    ];
    customHandlerTests.forEach(test => {
        describe(test.name, function() {
            test.tests.forEach(testCase => {
                it(testCase.name, async function() {
                    this.timeout(testCase.timeout || 5000);
                    const response = await test.handler.fetch(testCase.url);
                    expect(response.status).to.equal(testCase.expectedStatus);
                });
            });
        });
    });
});