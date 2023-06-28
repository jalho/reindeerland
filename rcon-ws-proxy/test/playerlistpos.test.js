import assert from "node:assert";
import mocha from "mocha";
import { playerlistpos } from "../dist/parsers/rcon.js";

mocha.describe("playerlistpos", () => {
    mocha.it("is defined", () => {
        assert.equal(typeof playerlistpos, "function");
    });
    mocha.it("parses two players", () => {
        const input = `SteamID           DisplayName POS                     ROT                
        76561199122118055 edgey       (324.6, 39.9, 456.1)    (-0.5, -0.4, -0.8) 
        76561198135242017 jka         (1533.4, 0.1, 1435.5)   (-0.6, -0.2, 0.8)  `;
        const expectedOutput = [
            { SteamID: "76561199122118055", DisplayName: "edgey", POS: [324.6, 39.9, 456.1], ROT: [-0.5, -0.4, -0.8] },
            { SteamID: "76561198135242017", DisplayName: "jka", POS: [1533.4, 0.1, 1435.5], ROT: [-0.6, -0.2, 0.8] },
        ];
        const actualOutput = playerlistpos(input);
        assert.deepStrictEqual(actualOutput, expectedOutput);
    });
});
