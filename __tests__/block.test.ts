import { describe, it, expect } from '@jest/globals';
import Block from '../src/lib/block';

describe("Block tests", () => {
    it("should be valid", () => {
        const block = new Block(1, "PREVIOUS","DATA");
        const valid = block.isValid();
        expect(valid).toBeTruthy();
    })
    it("should be NOT valid (previous hash)", () => {
        const block = new Block(1, "","DATA");
        const valid = block.isValid();
        expect(valid).toBeFalsy();
    })
    it("should be NOT valid (hash)", () => {
        const block = new Block(1, "PREVIOUS","DATA");
        block.hash = "";
        const valid = block.isValid();
        expect(valid).toBeFalsy();
    })
    it("should be NOT valid (timestamp)", () => {
        const block = new Block(1, "PREVIOUS","DATA");
        block.timestamp = -1;
        const valid = block.isValid();
        expect(valid).toBeFalsy();
    })
    it("should be NOT valid (data)", () => {
        const block = new Block(1, "PREVIOUS","");        
        const valid = block.isValid();
        expect(valid).toBeFalsy();
    })
    it("should be NOT valid (index)", () => {
        const block = new Block(-1, "PREVIOUS","DATA");
        const valid = block.isValid();
        expect(valid).toBeFalsy();
    })
})