import {
	ERROR_CODE_LIST,
	getErrorCodeByCode,
	getErrorCodeByHexString,
	getErrorCodeByValue,
	hasErrorCode,
	isSuccessCode,
} from '../src/ErrorCode';

describe('ErrorCode 错误码表', () => {
	test('按 code 查询', () => {
		const entry = getErrorCodeByCode(0x0a000005);
		expect(entry?.key).toBe('SAR_INVALIDHANDLEERR');
		expect(entry?.description).toBe('无效的句柄');
		expect(entry?.messageId).toBe('sar_invalidhandleerr');
	});
	test('按十六进制字符串查询（大端序）', () => {
		expect(getErrorCodeByHexString('0a000005')?.key).toBe('SAR_INVALIDHANDLEERR');
		expect(getErrorCodeByHexString('0a000024')?.key).toBe('SAR_PIN_INCORRECT');
	});
	test('未收录的码返回 undefined', () => {
		expect(getErrorCodeByHexString('0a000034')).toBeUndefined();
		expect(getErrorCodeByCode(0x12345678)).toBeUndefined();
	});
	test('按 value 查询（大小写不敏感）', () => {
		expect(getErrorCodeByValue('0X0A000005')?.key).toBe('SAR_INVALIDHANDLEERR');
	});
	test('isSuccessCode', () => {
		expect(isSuccessCode(0x00000000)).toBe(true);
		expect(isSuccessCode(0x0a000001)).toBe(false);
		expect(isSuccessCode('0x00000000')).toBe(true);
	});
	test('错误码表完整性：2023 版新增码已收录', () => {
		// 2012 版 51 条 + 2023 版新增 7 条
		expect(ERROR_CODE_LIST.length).toBe(58);
		expect(getErrorCodeByCode(0x0a000033)?.key).toBe('SAR_AUTH_BLOCKED');
		expect(getErrorCodeByCode(0x0a000036)?.key).toBe('SAR_CONTAINER_NOT_EXISTS');
		expect(getErrorCodeByCode(0x00000000)?.key).toBe('SAR_OK');
		expect(hasErrorCode(0x0a000039)).toBe(true);
	});
});
