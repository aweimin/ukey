/**
 * UKey操作响应类型定义
 */
export interface UKeyResponse {
	result: boolean;
	response: string;
	errorCode?: number;
}

export interface RSAKeyResult {
	flag: boolean;
	publicKey?: RSAKeyPair;
}
export interface RSAKeyPair {
	algId: number;
	len: number;
	modulus: string;
	publicExponent: string;
}

export interface ECCPublicKeyBlob {
	bits: number;
	x: string;
	y: string;
}

export interface ECCCipherBlobEx {
	x: string;
	y: string;
	HASH: string;
	CipherLen: number;
	Cipher: string;
}

const RSA_KEY_LENGTH_MAP = {
	RSA1024: 1024,
	RSA2048: 2048,
} as const;

export type RSAKeyLength = (typeof RSA_KEY_LENGTH_MAP)[keyof typeof RSA_KEY_LENGTH_MAP];
