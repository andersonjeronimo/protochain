import { describe, it, expect, beforeAll } from '@jest/globals';
import Block from '../src/lib/block';

describe("Block tests", () => {
    let genesis: Block;
    beforeAll(() => {
        genesis = new Block(0, "", "genesis block");
    });
    it("should be valid", () => {
        const block = new Block(1, genesis.hash, "block data");
        const valid = block.isValid(genesis.index, genesis.hash);
        expect(valid).toBeTruthy();
    })
    it("should NOT be valid", () => {
        let block = new Block(1, genesis.hash, "block data");
        block.previousHash = "invalid previous hash";
        const valid = block.isValid(genesis.index, genesis.hash);
        expect(valid).toBeFalsy();
    })
    it("should be NOT valid (previous hash)", () => {
        const block = new Block(1, "invalid previous hash", "block data");
        const valid = block.isValid(genesis.index, genesis.hash);
        expect(valid).toBeFalsy();
    })
    it("should be NOT valid (hash)", () => {
        const block = new Block(1, genesis.hash, "block data");
        block.hash = "";
        const valid = block.isValid(genesis.index, genesis.hash);
        expect(valid).toBeFalsy();
    })
    it("should be NOT valid (timestamp)", () => {
        const block = new Block(1, genesis.hash, "block data");
        block.timestamp = -1;
        const valid = block.isValid(genesis.index, genesis.hash);
        expect(valid).toBeFalsy();
    })
    it("should be NOT valid (data)", () => {
        const block = new Block(1, genesis.hash, "");
        const valid = block.isValid(genesis.index, genesis.hash);
        expect(valid).toBeFalsy();
    })
    it("should be NOT valid (index)", () => {
        const block = new Block(-1, genesis.hash, "block data");
        const valid = block.isValid(genesis.index, genesis.hash);
        expect(valid).toBeFalsy();
    })
})