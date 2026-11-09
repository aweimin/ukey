import { UKeyClient } from '../src/UKeyClient';
import { UKeyWebSocketClient } from '../src/UKeyWebSocketClient';

/**
 * 传输层 mock 辅助：拦截 UKeyWebSocketClient 原型上的指定方法，
 * 直接返回构造好的十六进制报文，模拟控件服务的响应
 */
type TransportMethod = Exclude<keyof UKeyWebSocketClient, 'onclose' | 'onerror'>;
const mockTransport = (method: TransportMethod, result: boolean, response: string): jest.Mock => {
	const spy = jest.spyOn(UKeyWebSocketClient.prototype, method) as jest.Mock;
	spy.mockResolvedValue({ result, response });
	return spy;
};

afterEach(() => {
	jest.restoreAllMocks();
});

describe('UKeyClient 报文解析', () => {
	let client: UKeyClient;
	beforeEach(() => {
		client = new UKeyClient('test-clsid');
	});

	describe('enumDev 枚举设备', () => {
		test('成功解析设备名列表', async () => {
			// 报文：响应码(00000000) + size(0c000000=12字节) + 设备名列表（'\0'分隔，尾部补00）
			mockTransport('enumDev', true, '00000000' + '0c000000' + '44657631004465763200');
			const res = await client.enumDev(true);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data).toEqual(['Dev1', 'Dev2']);
			}
		});
		test('传输层失败返回默认错误 SAR_FAIL', async () => {
			mockTransport('enumDev', false, '');
			const res = await client.enumDev(true);
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe(0x0a000001);
				expect(res.error.messageId).toBe('sar_fail');
			}
		});
		test('已收录的错误码（小端存放）正确映射', async () => {
			// 报文头 0500000a 小端存放，对应响应码 0x0a000005 SAR_INVALIDHANDLEERR
			mockTransport('enumDev', true, '0500000a');
			const res = await client.enumDev(true);
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe(0x0a000005);
				expect(res.error.messageId).toBe('sar_invalidhandleerr');
				expect(res.error.value).toBe('0x0a000005');
			}
		});
		test('未收录的错误码也视为失败并携带实际码值', async () => {
			// 0a000034 未收录在错误码表中，回归验证：不得被当作成功继续解析
			mockTransport('enumDev', true, '3400000a');
			const res = await client.enumDev(true);
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe(0x0a000034);
				expect(res.error.messageId).toBe('unknown');
				expect(res.error.value).toBe('0x0a000034');
			}
		});
		test('size 字段异常（不足8位hex导致NaN）返回失败', async () => {
			mockTransport('enumDev', true, '00000000' + '1234');
			const res = await client.enumDev(true);
			expect(res.success).toBe(false);
		});
	});

	describe('connectDev 连接设备', () => {
		test('成功返回设备句柄', async () => {
			// 报文：响应码(00000000) + 句柄(34120000 小端 = 0x1234)
			mockTransport('connectDev', true, '00000000' + '34120000');
			const res = await client.connectDev('Dev1');
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data).toBe(0x1234);
			}
		});
	});

	describe('disConnectDev 断开连接（十进制响应格式）', () => {
		test('成功码 0', async () => {
			mockTransport('disConnectDev', true, '0');
			const res = await client.disConnectDev(0x1234);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data).toBe(true);
			}
		});
		test('167772165（0x0a000005）映射为 SAR_INVALIDHANDLEERR', async () => {
			mockTransport('disConnectDev', true, '167772165');
			const res = await client.disConnectDev(0x1234);
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe(0x0a000005);
				expect(res.error.messageId).toBe('sar_invalidhandleerr');
			}
		});
	});

	describe('verifyPIN / changePIN（PIN 响应带剩余次数）', () => {
		test('verifyPIN 失败时解析剩余尝试次数', async () => {
			// 报文：响应码(0a000024 PIN不正确) + 剩余次数(03000000=3)
			mockTransport('verifyPIN', true, '2400000a' + '03000000');
			const res = await client.verifyPIN(1, 1, '12345678');
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe(0x0a000024);
				expect(res.error.remainingAttempts).toBe(3);
			}
		});
		test('verifyPIN 成功', async () => {
			mockTransport('verifyPIN', true, '00000000');
			const res = await client.verifyPIN(1, 1, '12345678');
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data).toBe(true);
			}
		});
		test('verifyPIN 剩余次数字段异常时兜底为 -1', async () => {
			mockTransport('verifyPIN', true, '2400000a' + '12');
			const res = await client.verifyPIN(1, 1, '12345678');
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.remainingAttempts).toBe(-1);
			}
		});
		test('changePIN 失败返回 UKeyPinResponse 结构', async () => {
			mockTransport('changePIN', true, '2400000a' + '05000000');
			const res = await client.changePIN(1, 1, '11111111', '22222222');
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.remainingAttempts).toBe(5);
			}
		});
	});

	describe('getContainerType 容器类型', () => {
		test('ECC 容器', async () => {
			mockTransport('getContainerType', true, '00000000' + '02000000');
			const res = await client.getContainerType(7);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data).toEqual({ type: 2, label: 'ECC容器' });
			}
		});
	});

	describe('exportCertificate 导出证书', () => {
		test('成功按 size 截取证书内容', async () => {
			mockTransport('exportCertificate', true, '00000000' + '06000000' + 'AABBCCDDEEFF');
			const res = await client.exportCertificate(7, true);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data).toBe('AABBCCDDEEFF');
			}
		});
		test('size 为 0 返回失败', async () => {
			mockTransport('exportCertificate', true, '00000000' + '00000000');
			const res = await client.exportCertificate(7, true);
			expect(res.success).toBe(false);
		});
	});

	describe('genRSAKeyPair 生成RSA密钥对', () => {
		test('bitLen 为位长，模数按位长换算右对齐截取', async () => {
			// 报文：响应码 + algId(21000000=0x21) + bitLen(00040000=1024) + 模数(256字节) + 指数(01000100=65537)
			const modulus = '00'.repeat(128) + 'AB'.repeat(128);
			const response = '00000000' + '21000000' + '00040000' + modulus + '01000100';
			mockTransport('genRSAKeyPair', true, response);
			const res = await client.genRSAKeyPair(7, 1024);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.algId).toBe(0x21);
				expect(res.data.bitLen).toBe(1024);
				// 模数按 128 字节右对齐截取，保留有效后半部分
				expect(res.data.modulus).toBe('AB'.repeat(128));
				expect(res.data.publicExponent).toBe('01000100');
			}
		});
		test('bitLen 异常返回失败', async () => {
			mockTransport('genRSAKeyPair', true, '00000000' + '21000000' + '1234');
			const res = await client.genRSAKeyPair(7, 2048);
			expect(res.success).toBe(false);
		});
	});

	describe('rsaExportSessionKey 导出RSA会话密钥', () => {
		test('成功解析会话密钥句柄与密文（回归恒失败bug）', async () => {
			// 报文：响应码(00000000) + 会话密钥句柄(05000000=5) + 密文长度(04000000=4) + 密文
			mockTransport('rsaExportSessionKey', true, '00000000' + '05000000' + '04000000' + 'AABBCCDD');
			const res = await client.rsaExportSessionKey(7, 0x00000401, 'A1'.repeat(128));
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.sessionKey).toBe(5);
				expect(res.data.cipher).toBe('AABBCCDD');
			}
		});
		test('密文长度异常返回失败', async () => {
			mockTransport('rsaExportSessionKey', true, '00000000' + '05000000' + '1234');
			const res = await client.rsaExportSessionKey(7, 0x00000401, 'A1'.repeat(128));
			expect(res.success).toBe(false);
		});
	});

	describe('genECCKeyPair 生成ECC密钥对', () => {
		test('成功解析位长与坐标', async () => {
			// 报文：响应码 + bitLen(00010000=256) + x坐标(64字节) + y坐标(64字节)
			const response = '00000000' + '00010000' + 'AA'.repeat(64) + 'BB'.repeat(64);
			mockTransport('genECCKeyPair', true, response);
			const res = await client.genECCKeyPair(7);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.bitLen).toBe(256);
				expect(res.data.xCoordinate).toBe('AA'.repeat(64));
				expect(res.data.yCoordinate).toBe('BB'.repeat(64));
			}
		});
	});

	describe('eccSignData ECC签名', () => {
		test('r/s 右对齐拼接为签名值', async () => {
			// r、s 各 64 字节，实际有效值在右半部分
			const r = '00'.repeat(32) + '11'.repeat(32);
			const s = '00'.repeat(32) + '22'.repeat(32);
			mockTransport('eccSignData', true, '00000000' + r + s);
			const res = await client.eccSignData(7, 'AABB');
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.r).toBe(r);
				expect(res.data.s).toBe(s);
				expect(res.data.signature).toBe('11'.repeat(32) + '22'.repeat(32));
			}
		});
	});

	describe('eccExportSessionKey 导出ECC会话密钥', () => {
		test('成功解析完整密文 Blob', async () => {
			// 报文：响应码 + 会话密钥句柄 + x(64字节) + y(64字节) + hash(32字节) + 密文长度 + 密文
			const response =
				'00000000' + '07000000' + 'AA'.repeat(64) + 'BB'.repeat(64) + 'CC'.repeat(32) + '04000000' + 'DDDDDDDD';
			mockTransport('eccExportSessionKey', true, response);
			const res = await client.eccExportSessionKey(7, 0x00000401, 'E1'.repeat(64));
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.sessionKey).toBe(7);
				expect(res.data.cipherBlob.xCoordinate).toBe('AA'.repeat(64));
				expect(res.data.cipherBlob.yCoordinate).toBe('BB'.repeat(64));
				expect(res.data.cipherBlob.hash).toBe('CC'.repeat(32));
				expect(res.data.cipherBlob.cipherLen).toBe(4);
				expect(res.data.cipherBlob.cipher).toBe('DDDDDDDD');
			}
		});
	});

	describe('getSKFileInfo 文件属性', () => {
		test('成功解析文件名与读写权限', async () => {
			// 报文：响应码 + 文件名(32字节，00填充) + 大小 + 读权限 + 写权限
			const name = '41424300' + '00'.repeat(28); // "ABC"
			const response = '00000000' + name + '64000000' + '01000000' + '02000000';
			mockTransport('getSKFileInfo', true, response);
			const res = await client.getSKFileInfo(1, 'ABC');
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.fileName).toBe('ABC');
				expect(res.data.fileSize).toBe(100);
				expect(res.data.readRights).toBe(1);
				expect(res.data.writeRights).toBe(2);
			}
		});
	});

	describe('genRandomData 生成随机数', () => {
		test('成功按 size 截取随机数', async () => {
			mockTransport('genRandomData', true, '00000000' + '10000000' + 'AA'.repeat(16));
			const res = await client.genRandomData(1, 16);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data).toBe('AA'.repeat(16));
			}
		});
	});

	describe('digest 摘要计算', () => {
		test('成功按长度截取摘要值', async () => {
			mockTransport('digest', true, '00000000' + '20000000' + 'AB'.repeat(32));
			const res = await client.digest(3, 'AABB');
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data).toBe('AB'.repeat(32));
			}
		});
	});

	describe('getDevInfo 设备信息', () => {
		test('成功解析标签与序列号', async () => {
			// label 位于偏移 268-332，serialNumber 位于 332-396（各32字节）
			const label = '4D794C6162656C' + '00'.repeat(25); // "MyLabel"
			const serial = '534E313233343536' + '00'.repeat(24); // "SN123456"
			const response = '00000000' + '00'.repeat(130) + label + serial;
			mockTransport('getDevInfo', true, response);
			const res = await client.getDevInfo(1);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.label).toBe('MyLabel');
				expect(res.data.serialNumber).toBe('SN123456');
			}
		});
		test('报文过短返回失败', async () => {
			mockTransport('getDevInfo', true, '00000000');
			const res = await client.getDevInfo(1);
			expect(res.success).toBe(false);
		});
	});

	describe('close 释放资源', () => {
		test('透传传输层结果并置成功', async () => {
			mockTransport('close', true, '0');
			const res = await client.close();
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data).toBe(true);
			}
		});
	});
});
