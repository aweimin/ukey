import { UKeyUtils } from '../src/UKeyUtils';

describe('UKeyUtils 十六进制工具', () => {
	describe('hexToInt（小端字节序转整数）', () => {
		test('小端字节序正确转换', () => {
			// 0x0a000005 按 GB/T 0016 报文小端存放为 '0500000a'
			expect(UKeyUtils.hexToInt('0500000a')).toBe(0x0a000005);
		});
		test('全零转换为 0', () => {
			expect(UKeyUtils.hexToInt('00000000')).toBe(0);
		});
		test('算法 ID 转换', () => {
			// SGD_SM4_ECB = 0x00000401，小端存放 '01040000'
			expect(UKeyUtils.hexToInt('01040000')).toBe(0x00000401);
		});
		test('非 8 位长度返回 NaN 而不是伪装值', () => {
			expect(Number.isNaN(UKeyUtils.hexToInt('1234'))).toBe(true);
			expect(Number.isNaN(UKeyUtils.hexToInt('1234567890'))).toBe(true);
		});
	});

	describe('reverseStrByHex', () => {
		test('按字节反转', () => {
			expect(UKeyUtils.reverseStrByHex('aabbccdd')).toBe('ddccbbaa');
		});
		test('非法长度返回空串', () => {
			expect(UKeyUtils.reverseStrByHex('abc')).toBe('');
			expect(UKeyUtils.reverseStrByHex('aabbccddeeff')).toBe('');
		});
	});

	describe('reverseHex / cutHex', () => {
		test('reverseHex 交换前后两半', () => {
			expect(UKeyUtils.reverseHex('aabbccdd')).toBe('ccddaabb');
		});
		test('cutHex 截取后半部分', () => {
			expect(UKeyUtils.cutHex('aabbccdd')).toBe('ccdd');
		});
	});

	describe('intToBigHex / intToHex', () => {
		test('intToBigHex 输出大端并补零到 8 位', () => {
			expect(UKeyUtils.intToBigHex(0x00000401)).toBe('00000401');
			expect(UKeyUtils.intToBigHex(0)).toBe('00000000');
		});
		test('intToHex 输出小端字节序', () => {
			expect(UKeyUtils.intToHex(0x00000401)).toBe('01040000');
			expect(UKeyUtils.intToHex(2048)).toBe('00080000');
		});
	});

	describe('hexToAscii', () => {
		test('正常转换', () => {
			expect(UKeyUtils.hexToAscii('313233')).toBe('123');
		});
		test('剥离尾部 00 填充字节', () => {
			expect(UKeyUtils.hexToAscii('31323300')).toBe('123');
			expect(UKeyUtils.hexToAscii('44657631004465763200')).toBe('Dev1\0Dev2');
		});
		test('空串返回空串', () => {
			expect(UKeyUtils.hexToAscii('')).toBe('');
		});
	});

	describe('toHexString', () => {
		test('每个字符转为 4 位十六进制', () => {
			expect(UKeyUtils.toHexString('123')).toBe('003100320033');
		});
	});

	describe('getResponseCode（报文头响应码）', () => {
		test('取前 8 个 hex 字符并反转为大端', () => {
			expect(UKeyUtils.getResponseCode('0500000a3132')).toBe('0a000005');
			expect(UKeyUtils.getResponseCode('00000000ffff')).toBe('00000000');
		});
		test('报文过短返回失败码 0a000001', () => {
			expect(UKeyUtils.getResponseCode('')).toBe('0a000001');
			expect(UKeyUtils.getResponseCode('1234')).toBe('0a000001');
		});
	});

	describe('checkResponse / checkCode', () => {
		test('checkResponse 判断大端响应码', () => {
			expect(UKeyUtils.checkResponse('00000000')).toBe(true);
			expect(UKeyUtils.checkResponse('0a000005')).toBe(false);
		});
		test('checkCode 兼容十进制数字符串与数字', () => {
			expect(UKeyUtils.checkCode(0)).toBe(true);
			expect(UKeyUtils.checkCode('0')).toBe(true);
			expect(UKeyUtils.checkCode('00000000')).toBe(true);
			expect(UKeyUtils.checkCode(167772165)).toBe(false);
			expect(UKeyUtils.checkCode('167772165')).toBe(false);
		});
	});
});
