import axios from 'axios';
import BlockInfo from '../lib/blockInfo';
import Block from '../lib/block';

const BLOCKCHAIN_SERVER = 'http://127.0.0.1:3000/';
const minerWallet = {
    privateKey: "privateKey",
    publicKey: "publicKey"
}

let mineCount = 0;

async function mine() {
    console.log("Coletando informações do próximo bloco...");
    const { data } = await axios.get(`${BLOCKCHAIN_SERVER}blocks/next`);    
    const blockInfo = data as BlockInfo;
    const newBlock = Block.fromBlockInfo(blockInfo, minerWallet.publicKey);    
    console.log(`Iniciando mineração do bloco # ${newBlock.index}...`);
    console.log(`Dificuldade atual da rede: ${blockInfo.difficulty}`);
    newBlock.mine(blockInfo.difficulty);
    console.log(`Bloco ${newBlock.hash} minerado com sucesso.`);
    try {
        await axios.post(`${BLOCKCHAIN_SERVER}blocks/`, newBlock);
        console.log("Bloco aceito na rede blockchain.");
        mineCount++;
        console.log(`Total de bloco(s) até o momento: ${mineCount}`);
    } catch (error: any) {
        console.error(error.response ? error.response.data : error.message)
    }
    
    setTimeout(() => {
        mine();
    }, 2000);
}

mine();

