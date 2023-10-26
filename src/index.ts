import Block from "./lib/block";
import BlockInfo from "./lib/blockInfo";
import Blockchain from "./lib/blockchain";
import Transaction from "./lib/transaction";
import TransactionType from "./lib/transactionType";
import Validation from "./lib/validation";


const blockchain: Blockchain = new Blockchain();

blockchain.addTransaction(new Transaction({ type: TransactionType.FEE, data: new Date().toString(), hash: "f001" } as Transaction));
blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString(), hash: "r001" } as Transaction));
blockchain.addTransaction(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString(), hash: "r002" } as Transaction));

const blockInfo1: BlockInfo = blockchain.getNextBlock();

const block1: Block = Block.fromBlockInfo(blockInfo1, `${process.env.WALLET_PUBLIC_KEY}`);

//block1.transactions.push(new Transaction({ type: TransactionType.REGULAR, data: new Date().toString(), hash: "later" } as Transaction));
//block1.transactions.pop();
block1.mine(1);

const validation1 = blockchain.addBlock(block1);

console.log(validation1.message);
