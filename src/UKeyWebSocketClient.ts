import { IUKeyWebSocketClient } from './IUKeyWebSocketClient';
import { UniqueIdGenerator } from './UniqueIdGenerator';
import { AlgorithmId, HashAlgId } from './constants';
import { UKeyWebSocketResponse, RSAKeyLength } from './types';

/**
 * UKey WebSocket客户端类
 * 提供与UKey控件通信的接口
 */
class UKeyWebSocketClient implements IUKeyWebSocketClient {
	private readonly module_: string = 'IActiveXCtrl';
	private readonly clsid: string;
	private ws: WebSocket | null = null;
	private readonly promiseResolvers_: Map<string, (value: UKeyWebSocketResponse) => void> = new Map();
	private readonly promiseRejectors_: Map<string, (reason: any) => void> = new Map();

	constructor(clsid: string) {
		this.clsid = clsid;
	}

	async init(wsUrl: string = 'wss://127.0.0.1:1237'): Promise<void> {
		return new Promise((resolve, reject) => {
			// 根据运行环境动态选择WebSocket实现
			if (typeof window !== 'undefined' && 'WebSocket' in window) {
				// 浏览器环境
				this.ws = new window.WebSocket(wsUrl) as WebSocket;
			} else if (typeof globalThis !== 'undefined' && 'WebSocket' in globalThis) {
				// Node 18+（全局 WebSocket）
				this.ws = new globalThis.WebSocket(wsUrl);
			} else {
				reject(new Error('WebSocket not supported in this environment'));
			}

			if (this.ws) {
				this.ws.onerror = () => {
					reject(new Error('Unable to establish connection to WebSocket'));
				};
				this.ws.onopen = () => resolve();
			} else {
				reject(new Error('Failed to create WebSocket instance'));
			}
		});
	}
	/**
	 * 加载模块
	 */
	loadModule(): Promise<UKeyWebSocketResponse> {
		return new Promise((resolve, reject) => {
			const msg_id = 'LoadModule';

			// 存储resolve和reject函数以便后续回调时使用
			this.promiseResolvers_.set(msg_id, resolve);
			this.promiseRejectors_.set(msg_id, reject);

			const msg = JSON.stringify({
				MsgId: msg_id,
				Module: this.module_,
			});

			if (this.ws) {
				this.ws.onmessage = (response: any) => this._callback(response);
				this.ws.send(msg);
			}
		});
	}

	/**
	 * 执行控件方法
	 * @param func - 方法名
	 * @param param - 参数数组
	 * @returns Promise，解析为结果对象
	 */
	private exec(func: string, param: any[]): Promise<UKeyWebSocketResponse> {
		return new Promise((resolve, reject) => {
			const msg_id = UniqueIdGenerator.generateId();

			const param_: {
				MsgId: string;
				Method: string;
				Param?: string;
			} = {
				MsgId: msg_id,
				Method: func + '|' + this.clsid,
			};
			if (param) {
				param_['Param'] = JSON.stringify(param);
			}
			const msg = JSON.stringify(param_);

			// 存储resolve和reject函数以便后续回调时使用
			this.promiseResolvers_.set(msg_id, resolve);
			this.promiseRejectors_.set(msg_id, reject);

			this.ws?.send(msg);
		});
	}

	/**
	 * 内部回调处理
	 * @param response - WebSocket响应
	 */
	private _callback(response: any): void {
		const r = JSON.parse(response.data || response);
		const msg_id = r.MsgId;

		// if (r.Result) {
		// 	console.info('i_return:' + r.Response);
		// } else {
		// 	console.error('e_return:' + r.response);
		// }

		// 获取对应的Promise处理函数
		const resolve = this.promiseResolvers_.get(msg_id);
		const reject = this.promiseRejectors_.get(msg_id);

		if (resolve) {
			// 调用resolve函数完成Promise
			resolve({ result: r.Result ?? false, response: r.Response ?? '' });

			// 清理存储的resolve和reject函数
			this.promiseResolvers_.delete(msg_id);
			if (reject) {
				this.promiseRejectors_.delete(msg_id);
			}
		}
	}

	// 设备管理相关方法
	/**
	 * 枚举设备
	 */
	enumDev(bPresent: boolean): Promise<UKeyWebSocketResponse> {
		return this.exec('EnumDev', [bPresent]);
	}
	/**
	 * 连接设备
	 * @param devName 设备名称
	 * @returns
	 */
	connectDev(devName: string): Promise<UKeyWebSocketResponse> {
		return this.exec('ConnectDev', [devName]);
	}

	/**
	 * 断开设备连接
	 * @param devHandle 设备句柄
	 * @returns
	 */
	disConnectDev(devHandle: number): Promise<UKeyWebSocketResponse> {
		return this.exec('DisConnectDev', [devHandle]);
	}

	/**
	 * 设置设备标签
	 * @param devHandle 设备句柄
	 * @param label 标签
	 * @returns
	 */
	setLabel(devHandle: number, label: string): Promise<UKeyWebSocketResponse> {
		return this.exec('SetLabel', [devHandle, label]);
	}

	/**
	 * 获取设备信息
	 * @param devHandle 设备句柄
	 * @returns
	 */
	getDevInfo(devHandle: number): Promise<UKeyWebSocketResponse> {
		return this.exec('GetDevInfo', [devHandle]);
	}

	// 应用管理相关方法
	/**
	 * 枚举应用
	 * @param devHandle 设备句柄
	 * @returns
	 */
	enumApplication(devHandle: number): Promise<UKeyWebSocketResponse> {
		return this.exec('EnumApplication', [devHandle]);
	}

	/**
	 * 打开应用
	 * @param devHandle 设备句柄
	 * @param appName 应用名称
	 * @returns
	 */
	openApplication(devHandle: number, appName: string): Promise<UKeyWebSocketResponse> {
		return this.exec('OpenApplication', [devHandle, appName]);
	}

	/**
	 * 验证PIN
	 * @param appHandle 应用句柄
	 * @param pinType PIN类型 1-用户PIN 0-管理员PIN
	 * @param pinValue PIN值
	 * @returns
	 */
	verifyPIN(appHandle: number, pinType: number, pinValue: string): Promise<UKeyWebSocketResponse> {
		return this.exec('VerifyPIN', [appHandle, pinType, pinValue]);
	}

	/**
	 * 修改PIN
	 * @param appHandle 应用句柄
	 * @param pinType PIN类型 1-用户PIN 0-管理员PIN
	 * @param oldPinValue 旧PIN值
	 * @param newPinValue 新PIN值
	 * @returns
	 */
	changePIN(
		appHandle: number,
		pinType: number,
		oldPinValue: string,
		newPinValue: string
	): Promise<UKeyWebSocketResponse> {
		return this.exec('ChangePIN', [appHandle, pinType, oldPinValue, newPinValue]);
	}

	/**
	 * 关闭应用
	 * @param appHandle 应用句柄
	 * @returns
	 */
	closeApplication(appHandle: number): Promise<UKeyWebSocketResponse> {
		return this.exec('CloseApplication', [appHandle]);
	}

	// 容器管理相关方法
	/**
	 * 枚举容器
	 * @param appHandle 应用句柄
	 * @returns
	 */
	enumContainer(appHandle: number): Promise<UKeyWebSocketResponse> {
		return this.exec('EnumContainer', [appHandle]);
	}

	/**
	 * 创建容器
	 * @param appHandle 应用句柄
	 * @param conName 容器名称
	 * @returns
	 */
	createContainer(appHandle: number, conName: string): Promise<UKeyWebSocketResponse> {
		return this.exec('CreateContainer', [appHandle, conName]);
	}

	/**
	 * 删除容器
	 * @param appHandle 应用句柄
	 * @param conName 容器名称
	 * @returns
	 */
	deleteContainer(appHandle: number, conName: string): Promise<UKeyWebSocketResponse> {
		return this.exec('DeleteContainer', [appHandle, conName]);
	}

	/**
	 * 打开容器
	 * @param appHandle 应用句柄
	 * @param conName 容器名称
	 * @returns
	 */
	openContainer(appHandle: number, conName: string): Promise<UKeyWebSocketResponse> {
		return this.exec('OpenContainer', [appHandle, conName]);
	}

	/**
	 * 关闭容器
	 * @param conHandle 容器句柄
	 * @returns
	 */
	closeContainer(conHandle: number): Promise<UKeyWebSocketResponse> {
		return this.exec('CloseContainer', [conHandle]);
	}

	/**
	 * 获取容器类型
	 * @param conHandle 容器句柄
	 * @returns
	 */
	getContainerType(conHandle: number): Promise<UKeyWebSocketResponse> {
		return this.exec('GetContainerType', [conHandle]);
	}

	// 证书管理相关方法
	/**
	 * 导入证书
	 * @param conHandle 容器句柄
	 * @param keyType true表示签名证书，false表示加密证书
	 * @param hexCert 证书内容
	 * @returns
	 */
	importCertificate(conHandle: number, keyType: boolean, hexCert: string): Promise<UKeyWebSocketResponse> {
		return this.exec('ImportCertificate', [conHandle, keyType, hexCert]);
	}

	/**
	 * 导出证书
	 * @param conHandle 容器句柄
	 * @param keyType true表示签名证书，false表示加密证书
	 * @returns
	 */
	exportCertificate(conHandle: number, keyType: boolean): Promise<UKeyWebSocketResponse> {
		return this.exec('ExportCertificate', [conHandle, keyType]);
	}

	/**
	 * 导出公钥
	 * @param conHandle 容器句柄
	 * @param keyType true表示签名公钥，false表示加密公钥
	 * @returns
	 */
	exportPublicKey(conHandle: number, keyType: boolean): Promise<UKeyWebSocketResponse> {
		return this.exec('ExportPublicKey', [conHandle, keyType]);
	}

	// 密钥生成相关方法
	/**
	 * 生成RSA密钥对
	 * @param conHandle 容器句柄
	 * @param bitLength 密钥长度
	 * @returns
	 */
	genRSAKeyPair(conHandle: number, bitLength: RSAKeyLength): Promise<UKeyWebSocketResponse> {
		return this.exec('GenRSAKeyPair', [conHandle, bitLength]);
	}

	/**
	 * 导入RSA密钥对
	 * @param conHandle 容器句柄
	 * @param algId 加密算法ID
	 * @param hexSessionKeyEncryptedData  包装的私钥数据（十六进制字符串）会话密钥的密文数据
	 * @param hexRsaPriKeyEncryptedData 加密的数据（十六进制字符串）RSA加密密钥对的私钥的密文数据)
	 */
	importRSAKeyPair(
		conHandle: number,
		algId: AlgorithmId,
		hexSessionKeyEncryptedData: string,
		hexRsaPriKeyEncryptedData: string
	): Promise<UKeyWebSocketResponse> {
		return this.exec('ImportRSAKeyPair', [conHandle, algId, hexSessionKeyEncryptedData, hexRsaPriKeyEncryptedData]);
	}
	/**
	 * RSA签名
	 * @param conHandle 容器句柄
	 * @param hexData 待签名数据的十六进制字符串
	 */
	rsaSignData(conHandle: number, hexData: string): Promise<UKeyWebSocketResponse> {
		return this.exec('RSASignData', [conHandle, hexData]);
	}

	/**
	 * 导出RSA会话密钥
	 * @param conHandle 容器句柄
	 * @param algId 加密算法ID
	 * @param hexPubKey 公钥的十六进制字符串
	 */
	rsaExportSessionKey(conHandle: number, algId: AlgorithmId, hexPubKey: string): Promise<UKeyWebSocketResponse> {
		return this.exec('RSAExportSessionKey', [conHandle, algId, hexPubKey]);
	}

	/**
	 * 生成ECC密钥对
	 * @param conHandle 容器句柄
	 */
	genECCKeyPair(conHandle: number): Promise<UKeyWebSocketResponse> {
		return this.exec('GenECCKeyPair', [conHandle]);
	}

	/**
	 * 导入ECC密钥对
	 * @param conHandle 容器句柄
	 * @param hexData 包含密钥对数据的十六进制字符
	 */
	importECCKeyPair(conHandle: number, hexData: string): Promise<UKeyWebSocketResponse> {
		return this.exec('ImportECCKeyPair', [conHandle, hexData]);
	}

	/**
	 * ECC签名
	 * @param conHandle 容器句柄
	 * @param hexData 待签名数据的十六进制字符串
	 */
	eccSignData(conHandle: number, hexData: string): Promise<UKeyWebSocketResponse> {
		return this.exec('ECCSignData', [conHandle, hexData]);
	}

	/**
	 *
	 * 导出ECC(SM2)会话密钥
	 * @param conHandle 容器句柄
	 * @param algId 加密算法ID
	 * @param hexPubKey 公钥的十六进制字符串
	 */
	eccExportSessionKey(conHandle: number, algId: AlgorithmId, hexPubKey: string): Promise<UKeyWebSocketResponse> {
		return this.exec('ECCExportSessionKey', [conHandle, algId, hexPubKey]);
	}

	// 加密解密相关方法
	/**
	 * 初始化加密会话
	 * @param sessionKey 会话密钥句柄
	 * @param hexEncParam 加密参数的十六进制字符串
	 */
	encryptInit(sessionKey: number, hexEncParam: string): Promise<UKeyWebSocketResponse> {
		return this.exec('EncryptInit', [sessionKey, hexEncParam]);
	}

	/**
	 * 加密数据
	 * @param sessionKey 会话密钥句柄
	 * @param hexData 待加密数据的十六进制字符串
	 */
	encrypt(sessionKey: number, hexData: string): Promise<UKeyWebSocketResponse> {
		return this.exec('Encrypt', [sessionKey, hexData]);
	}

	/**
	 * 加密数据 要配合encryptFinal使用
	 * @param sessionKey 会话密钥句柄
	 * @param hexData 待加密数据的十六进制字符串
	 */
	encryptUpdate(sessionKey: number, hexData: string): Promise<UKeyWebSocketResponse> {
		return this.exec('EncryptUpdate', [sessionKey, hexData]);
	}

	/**
	 * 加密数据完成 要配合encryptUpdate使用
	 * @param sessionKey 会话密钥句柄
	 */
	encryptFinal(sessionKey: number): Promise<UKeyWebSocketResponse> {
		return this.exec('EncryptFinal', [sessionKey]);
	}

	// 摘要计算相关方法
	/**
	 * 初始化摘要计算
	 * @param devHandle 设备句柄
	 * @param algId 摘要算法ID
	 * @param hexPubKey 公钥的十六进制字符串
	 * @param signerId 签名者ID
	 */
	digestInit(
		devHandle: number,
		algId: HashAlgId,
		hexPubKey: string,
		signerId: string
	): Promise<UKeyWebSocketResponse> {
		return this.exec('DigestInit', [devHandle, algId, hexPubKey, signerId]);
	}

	/**
	 * 摘要计算
	 * @param hashHandle 摘要句柄
	 * @param hexData 待摘要数据的十六进制字符串
	 */
	digest(hashHandle: number, hexData: string): Promise<UKeyWebSocketResponse> {
		return this.exec('Digest', [hashHandle, hexData]);
	}

	/**
	 * 摘要计算完成 要配合digestUpdate使用
	 * @param hashHandle 摘要句柄
	 * @param hexData 待摘要数据的十六进制字符串
	 */
	digestUpdate(hashHandle: number, hexData: string): Promise<UKeyWebSocketResponse> {
		return this.exec('DigestUpdate', [hashHandle, hexData]);
	}

	/**
	 * 摘要计算完成 要配合digestUpdate使用
	 * @param hashHandle 摘要句柄
	 */
	digestFinal(hashHandle: number): Promise<UKeyWebSocketResponse> {
		return this.exec('DigestFinal', [hashHandle]);
	}

	// 通用方法
	/**
	 * 关闭句柄
	 * @param handle 句柄
	 */
	closeHandle(handle: number): Promise<UKeyWebSocketResponse> {
		return this.exec('CloseHandle', [handle]);
	}

	// 文件管理相关方法
	/**
	 * 枚举SK文件
	 * @param appHandle 应用句柄
	 */
	enumSKFile(appHandle: number): Promise<UKeyWebSocketResponse> {
		return this.exec('EnumSKFile', [appHandle]);
	}
	/**
	 * 删除SK文件
	 * @param appHandle 应用句柄
	 * @param fileName 文件名
	 */
	deleteSKFile(appHandle: number, fileName: string): Promise<UKeyWebSocketResponse> {
		return this.exec('DeleteSKFile', [appHandle, fileName]);
	}

	/**
	 * 获取SK文件信息
	 * @param appHandle 应用句柄
	 * @param fileName 文件名
	 * @returns
	 */
	getSKFileInfo(appHandle: number, fileName: string): Promise<UKeyWebSocketResponse> {
		return this.exec('GetSKFileInfo', [appHandle, fileName]);
	}

	/**
	 * 创建SK文件
	 * @param appHandle 应用句柄
	 * @param fileName 文件名
	 * @param fileSize 文件大小
	 * @param read 读权限
	 * @param ulFIleWRight 写权限
	 */
	createSKFile(
		appHandle: number,
		fileName: string,
		fileSize: number,
		read: number,
		ulFIleWRight: number
	): Promise<UKeyWebSocketResponse> {
		return this.exec('CreateSKFile', [appHandle, fileName, fileSize, read, ulFIleWRight]);
	}

	/**
	 * 读取SK文件
	 * @param appHandle 应用句柄
	 * @param fileName 文件名
	 * @param offset 偏移
	 * @param length 长度
	 */
	readSKFile(appHandle: number, fileName: string, offset: number, length: number): Promise<UKeyWebSocketResponse> {
		return this.exec('ReadSKFile', [appHandle, fileName, offset, length]);
	}

	/**
	 * 写SK文件
	 * @param appHandle 应用句柄
	 * @param fileName 文件名
	 * @param offset 偏移
	 * @param data 数据
	 */
	writeSKFile(appHandle: number, fileName: string, offset: number, data: string): Promise<UKeyWebSocketResponse> {
		return this.exec('WriteSKFile', [appHandle, fileName, offset, data]);
	}

	/**
	 * 生成随机数
	 * @param devHandle 设备句柄
	 * @param length 长度
	 */
	genRandomData(devHandle: number, length: number): Promise<UKeyWebSocketResponse> {
		return this.exec('GenRandomData', [devHandle, length]);
	}
	/**
	 * 释放资源
	 */
	async close(): Promise<UKeyWebSocketResponse> {
		const response: UKeyWebSocketResponse = {
			result: true,
			response: '',
		};
		if (this.ws) {
			this.ws.close();
		}
		return response;
	}
}

export { UKeyWebSocketClient };
