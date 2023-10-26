import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import Blockchain from '../lib/blockchain';
import Block from '../lib/block';
import Transaction from '../lib/transaction';
import BlockInfo from '../lib/blockInfo';

/* c8 ignore next */
const PORT: number = parseInt(`${process.env.PORT || 3000}`);
const app = express();

/**
 * For supertest
 */
/* c8 ignore start */
if (process.argv.includes('--run')) app.use(morgan('tiny'));
/* c8 ignore end */
app.use(express.json());

const blockchain = new Blockchain();

app.get('/status', (req: Request, res: Response, next: NextFunction) => {
    res.json({
        numOfBlocks: blockchain.blocks.length,
        isValid: blockchain.isValid(),
        lastBlock: blockchain.blocks[blockchain.blocks.length - 1]
    });
})

app.get('/transactions', (req: Request, res: Response, next: NextFunction) => {
    res.json({
        nextTxs: blockchain.mempool.slice(0, Blockchain.TX_PER_BLOCK),
        totalTx: blockchain.mempool.length
    })
});

app.get('/blocks/next', (req: Request, res: Response, next: NextFunction) => {
    const blockInfo = blockchain.getNextBlock() as BlockInfo;    
    return res.json(blockInfo);
});

app.get('/blocks/:hash', (req: Request, res: Response, next: NextFunction) => {
    const hash = req.params.hash;
    let block = blockchain.getBlock(hash) as Block;
    if (!block) return res.sendStatus(404);
    return res.json(block);
});

app.post('/blocks', (req: Request, res: Response, next: NextFunction) => {    
    if (req.body.index < 0) return res.sendStatus(422);
    const block = new Block(req.body as Block);
    const validation = blockchain.addBlock(block);
    if (validation.success) {
        return res.status(201).json(block);
    } else {        
        return res.status(422).json(validation.message);
    }
});

app.post('/transactions', (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    if (data.hash === undefined) return res.sendStatus(422);
    const tx = new Transaction(data as Transaction);
    const validation = blockchain.addTransaction(tx);
    if (validation.success) {
        return res.status(201).json(tx);
    } else {
        return res.status(422).json(validation.message);
    }
});

/**
 * For supertest
 */
/* c8 ignore start */
if (process.argv.includes('--run')) app.listen(PORT, () => { console.log(`Blockchain app listening on port ${PORT}`) })
/* c8 ignore end */
/**
 * For supertest
 */
export { app }
