/**
 * UKey操作响应类型定义
 */
export interface UKeyWebSocketResponse {
	result: boolean;
	response: string;
}

/**
 * UKey操作响应类型定义
 */
export type UKeyResponse<T = any> = UKeySuccessResponse<T> | UKeyErrorResponse;
/**
 * UKey Pin操作响应类型定义
 */
export type UKeyPinResponse<T = any> = UKeySuccessResponse<T> | UKeyPinErrorResponse;

/**
 * UKey操作句柄类型定义
 */
export type UKeyHandleResponse = UKeyResponse<number>;

/**
 * UKey操作列表类型定义
 */
export type UKeyListResponse<T = any> = UKeyResponse<T[]>;

/**
 * UKey操作错误类型定义
 */
export interface UKeyError {
	code: number;
	value: string;
	message: string;
	messageId: string;
}
/**
 * UKey Pin操作错误类型定义
 */
export interface UKeyPinError extends UKeyError {
	remainingAttempts: number;
}

/**
 * UKey操作响应类型定义
 */
export interface UKeySuccessResponse<T = any> extends UKeyWebSocketResponse {
	success: true;
	data: T;
}

/**
 * UKey操作响应类型定义
 */
export interface UKeyErrorResponse extends UKeyWebSocketResponse {
	success: false;
	error: UKeyError;
}

/**
 * UKey Pin操作响应类型定义
 */
export interface UKeyPinErrorResponse extends UKeyWebSocketResponse {
	success: false;
	error: UKeyPinError;
}

/**
 * RSA公钥密钥类型定义
 */
export interface RsaPublicKeyBlob {
	algId: number;
	bitLen: number;
	modulus: string;
	publicExponent: string;
}

/**
 * RSA私钥密钥类型定义
 */
export interface RsaPrivateKeyBlob {
	algId: number;
	bitLen: number;
	modulus: string;
	publicExponent: string;
	privateExponent: string;
	prime1: string;
	prime2: string;
	prime1Exponent: string;
	prime2Exponent: string;
	coefficient: string;
}

/**
 * ECC公钥密钥类型定义
 */
export interface EccPublicKeyBlob {
	bitLen: number;
	xCoordinate: string;
	yCoordinate: string;
}

/**
 * ECC私钥密钥类型定义
 */
export interface EccPrivateKeyBlob {
	bitLen: number;
	privateKey: string;
}

/**
 * ECC密文类型定义
 * x + y + hash + cipher
 */
export interface EccCipherBlob {
	xCoordinate: string;
	yCoordinate: string;
	hash: string;
	cipherLen: number;
	cipher: string;
}

/**
 * ECC签名类型定义
 */
export interface EccSignatureBlob {
	r: string;
	s: string;
	signature: string;
}

const RSA_KEY_LENGTH_MAP = {
	RSA1024: 1024,
	RSA2048: 2048,
} as const;

export type RSAKeyLength = (typeof RSA_KEY_LENGTH_MAP)[keyof typeof RSA_KEY_LENGTH_MAP];

/**
 * 设备信息类型定义
 */
export interface DevInfo {
	serialNumber: string;
	label: string;
}

/**
 * 容器信息类型定义
 */
export interface ContainerType {
	type: number;
	label: string;
}

/**
 * 分组密码参数类型定义
 */
export interface BlockCipherParam {
	iv: string;
	ivLen: number;
	feedBitLen: number;
}

/**
 * 文件属性类型定义
 */
export interface FileAttribute {
	fileName: string;
	fileSize: number;
	readRights: number;
	writeRights: number;
}

/**
 * ECC会话密钥类型定义
 */
export interface EccSessionKey {
	sessionKey: number;
	cipherBlob: EccCipherBlob;
}

/**
 * RSA会话密钥类型定义
 */
export interface RsaSessionKey {
	sessionKey: number;
	cipher: string;
}
