/**
 * Elliptic-curve cryptography (ECC) is an approach to public-key cryptography 
 * based on the algebraic structure of elliptic curves over finite fields.
 */
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import { ECPairInterface } from 'ecpair/src/ecpair';

const ECPair = ECPairFactory(ecc);
const encoding = "hex";
/**
 * Wallet class
 */
export default class Wallet {
    privateKey: string;
    publicKey: string;
    /**
     * Wallet Import Format (WIF) is a standardized method for displaying Bitcoin private keys
     * using the Base58Check encoding scheme. WIF format was standardized in order to allow 
     * all Bitcoin wallets to import and export private keys.
     */
    constructor(wifOrPrivateKey?: string) {
        let keyPair: ECPairInterface | undefined;
        if (wifOrPrivateKey) {
            if (wifOrPrivateKey.length === 64) {
                keyPair = ECPair.fromPrivateKey(Buffer.from(wifOrPrivateKey, encoding));
            } else {
                keyPair = ECPair.fromWIF(wifOrPrivateKey);
            }
        } else {
            keyPair = ECPair.makeRandom();
        }        
        this.privateKey = keyPair.privateKey?.toString(encoding) || "";
        this.publicKey = keyPair.publicKey.toString(encoding);
    }
}