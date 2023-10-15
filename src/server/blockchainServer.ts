import express from 'express';
import morgan from 'morgan';
import Blockchain from '../lib/blockchain';
import Block from '../lib/block';

const port = 3000;
const app = express();

/**
 * For supertest
 */
if (process.argv.includes('--run')) app.use(morgan('tiny'));

app.use(express.json());

const blockchain = new Blockchain();
const previousHash = blockchain.blocks[blockchain.blocks.length - 1].hash;
const block2 = new Block(blockchain.nextIndex, previousHash, "First Block", 1, "minerWalletAddress");
blockchain.addBlock(block2);

app.get('/status', (req, res, next) => {
    res.json({
        numOfBlocks: blockchain.blocks.length,
        isValid: blockchain.isValid(),
        lastBlock: blockchain.blocks[blockchain.blocks.length - 1]
    });
})

app.get('/blocks/:hash', (req, res, next) => {
    const hash = req.params.hash;
    let block = blockchain.getBlock(hash);
    if (!block) return res.sendStatus(404);
    return res.json({ block });
});

app.post('/blocks', (req, res, next) => {
    const data = req.body.data;
    if (!data) return res.sendStatus(422);
    const validation = blockchain.addBlockByData(data);
    return res.status(201).json(validation.message);
    /* if (validation.success) {
        return res.status(201).json(validation.message);
    } else {
        return res.status(400).json(validation.message);
    } */
});

/**
 * For supertest
 */
if (process.argv.includes('--run')) app.listen(port, () => { console.log(`Blockchain app listening on port ${port}`) })

/**
 * For supertest
 */
export { app }
