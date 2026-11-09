import { UKeyWebSocketClient } from '../src/UKeyWebSocketClient';

describe('UKeyWebSocketClient 连接检查', () => {
	let client: UKeyWebSocketClient;
	beforeEach(() => {
		client = new UKeyWebSocketClient('test-clsid');
	});

	test('未 init 时 exec 类方法直接拒绝，不再永久挂起', async () => {
		// 回归验证：WebSocket 未连接时应立即 reject，而不是把 resolver 存入 Map 后永远等待
		await expect(client.enumDev(true)).rejects.toThrow('WebSocket 未连接');
	});

	test('未 init 时 loadModule 直接拒绝', async () => {
		await expect(client.loadModule()).rejects.toThrow('WebSocket 未连接');
	});
});
