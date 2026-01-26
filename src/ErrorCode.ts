// 辅助函数：将16进制字符串转换为数字
const hexStringToNumber = (hexStr: string): number => {
	// 移除0x前缀并转换为十进制数字
	return Number.parseInt(hexStr.replace(/^0x/i, ''), 16);
};

// 错误码常量定义
export const ERROR_CODES = {
	SAR_OK: { value: '0x00000000', code: 0x00000000, description: '成功' },
	SAR_FAIL: { value: '0x0a000001', code: 0x0a000001, description: '失败' },
	SAR_UNKNOWNERR: { value: '0x0a000002', code: 0x0a000002, description: '异常错误' },
	SAR_NOTSUPPORTYETERR: { value: '0x0a000003', code: 0x0a000003, description: '不支持的服务' },
	SAR_FILEERR: { value: '0x0a000004', code: 0x0a000004, description: '文件操作错误' },
	SAR_INVALIDHANDLEERR: { value: '0x0a000005', code: 0x0a000005, description: '无效的句柄' },
	SAR_INVALIDPARAMERR: { value: '0x0a000006', code: 0x0a000006, description: '无效的参数' },
	SAR_READFILEERR: { value: '0x0a000007', code: 0x0a000007, description: '读文件错误' },
	SAR_WRITEFILEERR: { value: '0x0a000008', code: 0x0a000008, description: '写文件错误' },
	SAR_NAMELENERR: { value: '0x0a000009', code: 0x0a000009, description: '名称长度错误' },
	SAR_KEYUSAGEERR: { value: '0x0a00000a', code: 0x0a00000a, description: '密钥用途错误' },
	SAR_MODULUSLENERR: { value: '0x0a00000b', code: 0x0a00000b, description: '模的长度错误' },
	SAR_NOTINITIALIZEERR: { value: '0x0a00000c', code: 0x0a00000c, description: '未初始化' },
	SAR_OBJERR: { value: '0x0a00000d', code: 0x0a00000d, description: '对象错误' },
	SAR_MEMORYERR: { value: '0x0a00000e', code: 0x0a00000e, description: '内存错误' },
	SAR_TIMEOUTERR: { value: '0x0a00000f', code: 0x0a00000f, description: '超时' },
	SAR_INDATALENERR: { value: '0x0a000010', code: 0x0a000010, description: '输入数据长度错误' },
	SAR_INDATAERR: { value: '0x0a000011', code: 0x0a000011, description: '输入数据错误' },
	SAR_GENRANDERR: { value: '0x0a000012', code: 0x0a000012, description: '生成随机数错误' },
	SAR_HASHOBJERR: { value: '0x0a000013', code: 0x0a000013, description: 'HASH 对象错' },
	SAR_HASHERR: { value: '0x0a000014', code: 0x0a000014, description: 'HASH 运算错误' },
	SAR_GENRSAKEYERR: { value: '0x0a000015', code: 0x0a000015, description: '产生 RSA 密钥错' },
	SAR_RSAMODULUSLENERR: { value: '0x0a000016', code: 0x0a000016, description: 'RSA 密钥较长错误' },
	SAR_CSPIMPRTPUBKEYERR: { value: '0x0a000017', code: 0x0a000017, description: 'CSP 服务导入公钥错误' },
	SAR_RSAENCERR: { value: '0x0a000018', code: 0x0a000018, description: 'RSA 加密错误' },
	SAR_RSADECERR: { value: '0x0a000019', code: 0x0a000019, description: 'RSA 解密错误' },
	SAR_HASHNOTEQUALEERR: { value: '0x0a00001a', code: 0x0a00001a, description: 'HASH 值不相等' },
	SAR_KEYNOTFOUNTERR: { value: '0x0a00001b', code: 0x0a00001b, description: '密钥未发现' },
	SAR_CERTNOTFOUNTERR: { value: '0x0a00001c', code: 0x0a00001c, description: '证书未发现' },
	SAR_NOTEXPORTERR: { value: '0x0a00001d', code: 0x0a00001d, description: '对象未导出' },
	SAR_DECKYPTPADERR: { value: '0x0a00001e', code: 0x0a00001e, description: '解密时做补丁错误' },
	SAR_MACLENERR: { value: '0x0a00001f', code: 0x0a00001f, description: 'MAC长度错误' },
	SAR_BUFFER_TOO_SMALL: { value: '0x0a000020', code: 0x0a000020, description: '缓冲区不足' },
	SAR_KEYINFOTYPEERR: { value: '0x0a000021', code: 0x0a000021, description: '密钥类型错误' },
	SAR_NOT_EVENTERR: { value: '0x0a000022', code: 0x0a000022, description: '无事件错误' },
	SAR_DEVICE_REMOVED: { value: '0x0a000023', code: 0x0a000023, description: '设备已移除' },
	SAR_PIN_INCORRECT: { value: '0x0a000024', code: 0x0a000024, description: 'PIN不正确' },
	SAR_PIN_LOCKED: { value: '0x0a000025', code: 0x0a000025, description: 'PIN被锁死' },
	SAR_PIN_INVALID: { value: '0x0a000026', code: 0x0a000026, description: 'PIN无效' },
	SAR_PIN_LEN_RANGE: { value: '0x0a000027', code: 0x0a000027, description: 'PIN长度错误' },
	SAR_USER_ALREADY_LOGGED_IN: { value: '0x0a000028', code: 0x0a000028, description: '用户已经登录' },
	SAR_USER_PIN_NOT_INITIALIZED: { value: '0x0a000029', code: 0x0a000029, description: '没有初始化用户口令' },
	SAR_USER_TYPE_INVALID: { value: '0x0a00002a', code: 0x0a00002a, description: 'PIN类型错误' },
	SAR_APPLICATION_NAME_INVALID: { value: '0x0a00002b', code: 0x0a00002b, description: '应用名称无效' },
	SAR_APPLICATION_EXISTS: { value: '0x0a00002c', code: 0x0a00002c, description: '应用已经存在' },
	SAR_USER_NOT_LOGGED_IN: { value: '0x0a00002d', code: 0x0a00002d, description: '用户没有登录' },
	SAR_APPLICATION_NOT_EXISTS: { value: '0x0a00002e', code: 0x0a00002e, description: '应用不存在' },
	SAR_FILE_ALREADY_EXIST: { value: '0x0a00002f', code: 0x0a00002f, description: '文件已经存在' },
	SAR_NO_ROOM: { value: '0x0a000030', code: 0x0a000030, description: '空间不足' },
	SAR_FILE_NOT_EXIST: { value: '0x0a000031', code: 0x0a000031, description: '文件不存在' },
	SAR_REACH_MAX_CONTAINER_COUNT: { value: '0x0a000032', code: 0x0a000032, description: '已达到最大可管理容器数' },
	// GM/T0016-2023 新增的错误码
	SAR_AUTH_BLOCKED: { value: '0x0a000033', code: 0x0a000033, description: '密钥已被锁住' },
	SAR_INVALIDCONTAINERERR: { value: '0x0a000035', code: 0x0a000035, description: '无效容器' },
	SAR_CONTAINER_NOT_EXISTS: { value: '0x0a000036', code: 0x0a000036, description: '容器不存在' },
	SAR_CONTAINER_EXISTS: { value: '0x0a000037', code: 0x0a000037, description: '容器已存在' },
	SAR_KEYNOUSAGEERR: { value: '0x0a000039', code: 0x0a000039, description: '密钥未被使用' },
	SAR_FILEATTRIBUTEERR: { value: '0x0a00003a', code: 0x0a00003a, description: '文件操作权限错误' },
	SAR_DEVNOAUTH: { value: '0x0a00003b', code: 0x0a00003b, description: '设备未认证' },
} as const;

// 类型定义
export type ErrorCodeKey = keyof typeof ERROR_CODES;
export type ErrorCodeValue = (typeof ERROR_CODES)[ErrorCodeKey]['value'];
export type ErrorCodeEntry = {
	key: ErrorCodeKey;
	description: string;
	value: ErrorCodeValue;
	code: number;
	messageId: string; // 使用小写的key作为messageId
};

// 获取所有错误码的数组
export const ERROR_CODE_LIST: ErrorCodeEntry[] = Object.entries(ERROR_CODES).map(([key, data]) => ({
	key: key as ErrorCodeKey,
	description: data.description,
	value: data.value,
	code: data.code,
	messageId: key.toLowerCase(), // messageId变为小写
}));

// 通过值查找错误码
export const getErrorCodeByValue = (value: string): ErrorCodeEntry | undefined => {
	// 将输入值转换为小写进行匹配
	const normalizedValue = value.toLowerCase();
	return ERROR_CODE_LIST.find((item) => item.value === normalizedValue);
};

// 通过code查找错误码
export const getErrorCodeByCode = (code: number): ErrorCodeEntry | undefined => {
	return ERROR_CODE_LIST.find((item) => item.code === code);
};

// 通过key查找错误码
export const getErrorCodeByKey = (key: ErrorCodeKey): ErrorCodeEntry | undefined => {
	return ERROR_CODE_LIST.find((item) => item.key === key);
};

// 获取所有错误码的Map，方便快速查找
export const ERROR_CODE_MAP = new Map<string, ErrorCodeEntry>(ERROR_CODE_LIST.map((item) => [item.key, item]));

// 通过十六进制字符串转换为错误码
export const getErrorCodeByHexString = (hexStr: string): ErrorCodeEntry | undefined => {
	const code = hexStringToNumber(hexStr);
	return getErrorCodeByCode(code);
};

// 检查是否为成功的错误码
export function isSuccessCode(code: number | string): boolean {
	if (typeof code === 'string') {
		const normalizedCode = code.toLowerCase();
		return normalizedCode === '0x00000000';
	}
	return code === 0x00000000;
}

// 获取错误码按code排序的列表
export const ERROR_CODE_LIST_SORTED: ErrorCodeEntry[] = [...ERROR_CODE_LIST].sort((a, b) => a.code - b.code);

// 检查错误码是否存在（通过code）
export const hasErrorCode = (code: number): boolean => {
	return ERROR_CODE_LIST.some((item) => item.code === code);
};

// 获取所有错误码的code列表
export const ERROR_CODE_VALUES: number[] = ERROR_CODE_LIST.map((item) => item.code);

// 获取所有错误码的value列表
export const ERROR_HEX_VALUES: string[] = ERROR_CODE_LIST.map((item) => item.value);

// 通过部分描述查找错误码（模糊搜索）
export const searchErrorCodesByDescription = (keyword: string): ErrorCodeEntry[] => {
	const lowerKeyword = keyword.toLowerCase();
	return ERROR_CODE_LIST.filter(
		(item) => item.description.toLowerCase().includes(lowerKeyword) || item.key.toLowerCase().includes(lowerKeyword)
	);
};
