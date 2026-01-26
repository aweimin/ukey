/**
 * UKey算法ID常量定义
 */

export const ALGORITHM_IDS = {
	SGD_SM1_ECB: 0x00000101,
	SGD_SM1_CBC: 0x00000102,
	SGD_SM4_ECB: 0x00000401,
	SGD_SM4_CBC: 0x00000402,
	UNKNOWN: 0x0,
} as const;

/**
 * 算法ID类型
 */
export type AlgorithmId = (typeof ALGORITHM_IDS)[keyof typeof ALGORITHM_IDS];

/**
 * 获取算法ID根据算法类型字符串
 * @param algType 算法类型字符串
 * @returns 对应的算法ID
 */
export function getAlgorithmId(algType: string): AlgorithmId {
	switch (algType.toUpperCase()) {
		case 'SGD_SM1_ECB':
			return ALGORITHM_IDS.SGD_SM1_ECB;
		case 'SGD_SM1_CBC':
			return ALGORITHM_IDS.SGD_SM1_CBC;
		case 'SGD_SM4_ECB':
			return ALGORITHM_IDS.SGD_SM4_ECB;
		case 'SGD_SM4_CBC':
			return ALGORITHM_IDS.SGD_SM4_CBC;
		default:
			return ALGORITHM_IDS.UNKNOWN;
	}
}

/**
 * UKey哈希算法ID常量定义
 */
export const HASHALGO_IDS = {
	SGD_SM3: 0x00000001,
	SGD_SHA1: 0x00000002,
	SGD_SHA256: 0x00000004,
	// SGD_SHA384: 0x00000004,
	// SGD_SHA512: 0x00000005,
	UNKNOWN: 0x0,
} as const;

/**
 * Hash算法ID类型
 */
export type HashAlgId = (typeof HASHALGO_IDS)[keyof typeof HASHALGO_IDS];

/**
 * 根据算法类型返回对应的哈希算法ID
 * @param algType 算法类型字符串
 * @returns 对应的哈希算法ID
 */
export function getHashAlgId(algType: string): HashAlgId {
	switch (algType.toLowerCase()) {
		case 'sgd_sm3':
		case 'sm3':
			return HASHALGO_IDS.SGD_SM3;
		case 'sgd_sha1':
		case 'sha1':
			return HASHALGO_IDS.SGD_SHA1;
		case 'sgd_sha256':
		case 'sha256':
			return HASHALGO_IDS.SGD_SHA256;
		default:
			return HASHALGO_IDS.UNKNOWN;
	}
}
