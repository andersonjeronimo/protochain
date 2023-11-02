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
    keyPair: ECPairInterface | undefined;
    privateKey: string | undefined;
    publicKey: string | undefined;
    /**
     * Wallet Import Format (WIF) is a standardized method for displaying Bitcoin private keys
     * using the Base58Check encoding scheme. WIF format was standardized in order to allow 
     * all Bitcoin wallets to import and export private keys.
     */
    constructor(wifOrKey?: string) {
        if (wifOrKey) {
            wifOrKey.length < 65 ?
                this.recoverFromPrivateKey(wifOrKey) :
                this.recoverFromWIF(wifOrKey);
        } else {
            this.keyPair = ECPair.makeRandom();
            this.privateKey = this.keyPair.privateKey?.toString(encoding) || undefined;
            this.publicKey = this.keyPair.publicKey.toString(encoding);
        }
    }

    recoverFromWIF(WIF: string) {
        this.keyPair = ECPair.fromWIF(WIF);
        this.privateKey = this.keyPair.privateKey?.toString(encoding) || undefined;
        this.publicKey = this.keyPair.publicKey.toString(encoding);
    }

    recoverFromPrivateKey(privateKey: string) {
        this.keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, encoding));
        this.privateKey = this.keyPair.privateKey?.toString(encoding) || undefined;
        this.publicKey = this.keyPair.publicKey.toString(encoding);
    }
}