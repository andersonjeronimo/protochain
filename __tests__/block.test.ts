import { describe, it, expect } from '@jest/globals';
import Block from '../src/lib/block';

describe("Block tests", () => {
    it("should be valid", () => {
        const block = new Block(1, "anyhash");
        const valid = block.isValid();
        expect(valid).toBeTruthy();
    })
    it("should be NOT valid (hash)", () => {
        const block = new Block(1, "");
        const valid = block.isValid();
        expect(valid).toBeFalsy();
    })
    it("should be NOT valid (index)", () => {
        const block = new Block(-1, "anyhash");
        const valid = block.isValid();
        expect(valid).toBeFalsy();
    })
})