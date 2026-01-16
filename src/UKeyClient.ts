import { IUKeyWebSocketClient } from './IUKeyWebSocketClient';
import { UKeyUtils } from './UKeyUtils';
import { UKeyWebSocketClient } from './UKeyWebSocketClient';
import { AlgorithmId, HashAlgoId } from './constants';
import { ECCPublicKeyBlob, RSAKeyLength, RSAKeyResult, UKeyResponse } from './types';

class UKeyClient implements IUKeyWebSocketClient {
	private readonly ukeyWebSocketClient: UKeyWebSocketClient;

	constructor(clsid: string) {
		this.ukeyWebSocketClient = new UKeyWebSocketClient(clsid);
	}

	async init(wsUrl: string = 'wss://127.0.0.1:1237'): Promise<void> {
		return this.ukeyWebSocketClient.init(wsUrl);
	}
	/**
	 * 加载模块
	 */
	async loadModule(): Promise<UKeyResponse> {
		return this.ukeyWebSocketClient.loadModule();
	}

	// 设备管理相关方法
	/**
	 * 枚举设备
	 */
	async enumDev(bPresent: boolean): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.enumDev(bPresent);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (responseCode == null) {
				newResponse.result = false;
				newResponse.response = 'EnumDev error. ' + 'responseCode is null';
				return newResponse;
			}
			const size = UKeyUtils.hexToInt(response.substring(8, 16));
			if (size < 1) {
				newResponse.result = false;
				newResponse.response = 'EnumDev error. ' + 'size < 1';
				return newResponse;
			}

			const resultStr = UKeyUtils.hexToAscii(response.substring(16, 16 + size * 2 - 2 * 2));
			if (resultStr == null) {
				newResponse.result = false;
				newResponse.response = 'EnumDev error. ' + 'hexToAscii error';
			} else {
				const devNameList = resultStr.split('\0');
				if (devNameList.length < 1) {
					newResponse.result = false;
					newResponse.response = 'EnumDev error. ' + 'l_DevNameList.length < 1';
				} else {
					newResponse.result = true;
					newResponse.response = JSON.stringify(devNameList);
				}
			}
		} else {
			newResponse.response = 'EnumDev error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 连接设备
	 * @param devName 设备名称
	 * @returns
	 */
	async connectDev(devName: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.connectDev(devName);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'ConnectDev error. response is null';
			} else {
				const ret = UKeyUtils.hexToInt(response.substring(0, 8));
				if (UKeyUtils.checkCode(ret)) {
					const handle = UKeyUtils.hexToInt(response.substring(8, 16));
					newResponse.result = true;
					newResponse.response = JSON.stringify(handle);
				} else {
					newResponse.result = false;
					newResponse.response = 'ConnectDev error. ' + 'ret != 0x00';
				}
			}
		} else {
			newResponse.response = 'ConnectDev error. ' + response;
		}
		return newResponse;
	}
	/**
	 * 断开设备连接
	 * @param devHandle 设备句柄
	 * @returns
	 */
	async disConnectDev(devHandle: number): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.disConnectDev(devHandle);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;

		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'DisconnectDev error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
			} else {
				newResponse.result = false;
				newResponse.response = 'DisconnectDev error. response != 0x00';
			}
		} else {
			newResponse.response = 'DisconnectDev error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 设置设备标签
	 * @param devHandle 设备句柄
	 * @param label 标签
	 * @returns
	 */
	async setLabel(devHandle: number, label: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.setLabel(devHandle, label);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'SetLabel error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
			} else {
				newResponse.result = false;
				newResponse.response = 'SetLabel error. response != 0x00';
			}
		} else {
			newResponse.response = 'SetLabel error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 获取设备信息
	 * @param devHandle 设备句柄
	 * @returns
	 */
	async getDevInfo(devHandle: number): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.getDevInfo(devHandle);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'GetDevInfo error. response is null';
			} else {
				const devInfo = response;
				if (devInfo == null || devInfo.length < 332) {
					newResponse.result = false;
					newResponse.response = 'GetDevInfo error. Invalid response length';
				} else {
					newResponse.result = true;
					const label = UKeyUtils.hexToAscii(devInfo.substring(268, 332));
					const SerialNumber = UKeyUtils.hexToAscii(devInfo.substring(332, 396));
					newResponse.response = JSON.stringify({
						label,
						SerialNumber,
					});
				}
			}
		} else {
			newResponse.response = 'GetDevInfo error. ' + response;
		}
		return newResponse;
	}

	// 应用管理相关方法
	/**
	 * 枚举应用
	 * @param devHandle 设备句柄
	 * @returns
	 */
	async enumApplication(devHandle: number): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.enumApplication(devHandle);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (responseCode == null) {
				newResponse.result = false;
				newResponse.response = 'EnumApplication error. responseCode is null';
				return newResponse;
			}
			const size = UKeyUtils.hexToInt(response.substring(8, 16));
			if (size < 1) {
				newResponse.result = false;
				newResponse.response = 'EnumApplication error. size < 1';
				return newResponse;
			}

			const resultStr = UKeyUtils.hexToAscii(response.substring(16, 16 + size * 2 - 2 * 2));
			if (resultStr == null) {
				newResponse.result = false;
				newResponse.response = 'EnumApplication error. hexToAscii error';
			} else {
				const appNameList = resultStr.split('\0');
				if (appNameList.length < 1) {
					newResponse.result = false;
					newResponse.response = 'EnumApplication error. appNameList.length < 1';
				} else {
					newResponse.result = true;
					newResponse.response = JSON.stringify(appNameList);
				}
			}
		} else {
			newResponse.response = 'EnumApplication error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 打开应用
	 * @param devHandle 设备句柄
	 * @param appName 应用名称
	 * @returns
	 */
	async openApplication(devHandle: number, appName: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.openApplication(devHandle, appName);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (responseCode == null) {
				newResponse.result = false;
				newResponse.response = 'OpenApplication error. responseCode is null';
				return newResponse;
			}

			const ret = UKeyUtils.hexToInt(response.substring(0, 8));
			if (UKeyUtils.checkCode(ret)) {
				const handle = UKeyUtils.hexToInt(response.substring(8, 16));
				newResponse.result = true;
				newResponse.response = JSON.stringify(handle);
			} else {
				newResponse.result = false;
				newResponse.response = 'OpenApplication error. checkCode failed';
			}
		} else {
			newResponse.response = 'OpenApplication error. ' + response;
		}
		return newResponse;
	}
	/**
	 * 验证PIN
	 * @param appHandle 应用句柄
	 * @param pinType PIN类型 1-用户PIN 0-管理员PIN
	 * @param pinValue PIN值
	 * @returns
	 */
	async verifyPIN(appHandle: number, pinType: number, pinValue: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.verifyPIN(appHandle, pinType, pinValue);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const pinResult = UKeyUtils.hexToInt(response.substring(8, 16));
			if (UKeyUtils.checkCode(responseCode)) {
				newResponse.result = true;
				newResponse.response = 'VerifyPIN success';
			} else {
				newResponse.result = false;
				newResponse.response = 'VerifyPIN error. Remaining attempts: ' + pinResult.toString();
			}
		} else {
			newResponse.response = 'VerifyPIN error. ' + response;
		}
		return newResponse;
	}
	/**
	 * 修改PIN
	 * @param appHandle 应用句柄
	 * @param pinType PIN类型 1-用户PIN 0-管理员PIN
	 * @param oldPinValue 旧PIN值
	 * @param newPinValue 新PIN值
	 * @returns
	 */
	async changePIN(
		appHandle: number,
		pinType: number,
		oldPinValue: string,
		newPinValue: string
	): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.changePIN(appHandle, pinType, oldPinValue, newPinValue);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const pinResult = UKeyUtils.hexToInt(response.substring(8, 16));

			if (UKeyUtils.checkCode(responseCode)) {
				newResponse.result = true;
				newResponse.response = 'ChangePIN success';
			} else {
				newResponse.result = false;
				newResponse.response = 'ChangePIN error. Remaining attempts: ' + pinResult.toString();
			}
		} else {
			newResponse.response = 'ChangePIN error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 关闭应用
	 * @param appHandle 应用句柄
	 * @returns
	 */
	async closeApplication(appHandle: number): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.closeApplication(appHandle);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'CloseApplication error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
			} else {
				newResponse.result = false;
				newResponse.response = 'CloseApplication error. response != 0x00';
			}
		} else {
			newResponse.response = 'CloseApplication error. ' + response;
		}
		return newResponse;
	}

	// 容器管理相关方法
	/**
	 * 枚举容器
	 * @param appHandle 应用句柄
	 * @returns
	 */
	async enumContainer(appHandle: number): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.enumContainer(appHandle);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (responseCode == null) {
				newResponse.result = false;
				newResponse.response = 'EnumContainer error. responseCode is null';
				return newResponse;
			}
			const size = UKeyUtils.hexToInt(response.substring(8, 16));
			if (size < 1) {
				newResponse.result = false;
				newResponse.response = 'EnumContainer error. size < 1';
				return newResponse;
			}

			const resultStr = UKeyUtils.hexToAscii(response.substring(16, 16 + size * 2 - 2 * 2));
			if (resultStr == null) {
				newResponse.result = false;
				newResponse.response = 'EnumContainer error. hexToAscii error';
			} else {
				const containerNameList = resultStr.split('\0');
				if (containerNameList.length < 1) {
					newResponse.result = false;
					newResponse.response = 'EnumContainer error. containerNameList.length < 1';
				} else {
					newResponse.result = true;
					newResponse.response = JSON.stringify(containerNameList);
				}
			}
		} else {
			newResponse.response = 'EnumContainer error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 创建容器
	 * @param appHandle 应用句柄
	 * @param conName 容器名称
	 * @returns
	 */
	async createContainer(appHandle: number, conName: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.createContainer(appHandle, conName);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (responseCode == null) {
				newResponse.result = false;
				newResponse.response = 'CreateContainer error. responseCode is null';
				return newResponse;
			}

			const ret = UKeyUtils.hexToInt(response.substring(0, 8));
			if (UKeyUtils.checkCode(ret)) {
				const handle = UKeyUtils.hexToInt(response.substring(8, 16));
				newResponse.result = true;
				newResponse.response = JSON.stringify(handle);
			} else {
				newResponse.result = false;
				newResponse.response = 'CreateContainer error. checkCode failed';
			}
		} else {
			newResponse.response = 'CreateContainer error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 删除容器
	 * @param appHandle 应用句柄
	 * @param conName 容器名称
	 * @returns
	 */
	async deleteContainer(appHandle: number, conName: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.deleteContainer(appHandle, conName);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'DeleteContainer error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
				newResponse.response = 'DeleteContainer success';
			} else {
				newResponse.result = false;
				newResponse.response = 'DeleteContainer error. response != 0x00';
			}
		} else {
			newResponse.response = 'DeleteContainer error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 打开容器
	 * @param appHandle 应用句柄
	 * @param conName 容器名称
	 * @returns
	 */
	async openContainer(appHandle: number, conName: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.openContainer(appHandle, conName);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (responseCode == null) {
				newResponse.result = false;
				newResponse.response = 'OpenContainer error. responseCode is null';
				return newResponse;
			}

			const ret = UKeyUtils.hexToInt(response.substring(0, 8));
			if (UKeyUtils.checkCode(ret)) {
				const handle = UKeyUtils.hexToInt(response.substring(8, 16));
				newResponse.result = true;
				newResponse.response = JSON.stringify(handle);
			} else {
				newResponse.result = false;
				newResponse.response = 'OpenContainer error. checkCode failed';
			}
		} else {
			newResponse.response = 'OpenContainer error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 关闭容器
	 * @param conHandle 容器句柄
	 * @returns
	 */
	async closeContainer(conHandle: number): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.closeContainer(conHandle);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'CloseContainer error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
				newResponse.response = 'CloseContainer success';
			} else {
				newResponse.result = false;
				newResponse.response = 'CloseContainer error. response != 0x00';
			}
		} else {
			newResponse.response = 'CloseContainer error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 获取容器类型
	 * @param conHandle 容器句柄
	 * @returns
	 */
	async getContainerType(conHandle: number): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.getContainerType(conHandle);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (responseCode == null) {
				newResponse.result = false;
				newResponse.response = 'GetContainerType error. responseCode is null';
				return newResponse;
			}

			const ret = UKeyUtils.hexToInt(response.substring(0, 8));
			if (UKeyUtils.checkCode(ret)) {
				const typeValue = UKeyUtils.hexToInt(response.substring(8, 16));
				let typeDesc = '混沌状态';
				if (typeValue === 0) {
					typeDesc = '空容器';
				} else if (typeValue === 1) {
					typeDesc = 'RSA容器';
				} else if (typeValue === 2) {
					typeDesc = 'ECC容器';
				}
				newResponse.result = true;
				newResponse.response = typeDesc;
			} else {
				newResponse.result = false;
				newResponse.response = 'GetContainerType error. checkCode failed';
			}
		} else {
			newResponse.response = 'GetContainerType error. ' + response;
		}
		return newResponse;
	}

	// 证书管理相关方法
	/**
	 * 导入证书
	 * @param conHandle 容器句柄
	 * @param keyType true表示签名证书，false表示加密证书
	 * @param hexCert 证书内容
	 * @returns
	 */
	async importCertificate(conHandle: number, keyType: boolean, hexCert: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.importCertificate(conHandle, keyType, hexCert);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'ImportCertificate error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
				newResponse.response = 'ImportCertificate success';
			} else {
				newResponse.result = false;
				newResponse.response = 'ImportCertificate error. response != 0x00';
			}
		} else {
			newResponse.response = 'ImportCertificate error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 导出证书
	 * @param conHandle 容器句柄
	 * @param keyType true表示签名证书，false表示加密证书
	 * @returns
	 */
	async exportCertificate(conHandle: number, keyType: boolean): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.exportCertificate(conHandle, keyType);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (responseCode == null) {
				newResponse.result = false;
				newResponse.response = 'ExportCertificate error. responseCode is null';
				return newResponse;
			}
			const size = UKeyUtils.hexToInt(response.substring(8, 16));
			if (size < 1) {
				newResponse.result = false;
				newResponse.response = 'ExportCertificate error. size < 1';
				return newResponse;
			}

			const resultStr = response.substring(16, 16 + size * 2);
			newResponse.result = true;
			newResponse.response = resultStr;
		} else {
			newResponse.response = 'ExportCertificate error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 导出公钥
	 * @param conHandle 容器句柄
	 * @param keyType true表示签名公钥，false表示加密公钥
	 * @returns
	 */
	async exportPublicKey(conHandle: number, keyType: boolean): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.exportPublicKey(conHandle, keyType);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (UKeyUtils.checkCode(responseCode)) {
				const pubKeyLen = UKeyUtils.hexToInt(response.substring(8, 16));
				const pubKey = response.substring(16, 16 + pubKeyLen * 2);
				newResponse.result = true;
				newResponse.response = pubKey;
			} else {
				newResponse.result = false;
				newResponse.response = 'ExportPublicKey error. checkCode failed';
			}
		} else {
			newResponse.response = 'ExportPublicKey error. ' + response;
		}
		return newResponse;
	}

	// 密钥生成相关方法
	/**
	 * 生成RSA密钥对
	 * @param conHandle 容器句柄
	 * @param bitLength 密钥长度
	 * @returns
	 */
	async genRSAKeyPair(conHandle: number, bitLength: RSAKeyLength): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.genRSAKeyPair(conHandle, bitLength);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (UKeyUtils.checkCode(responseCode)) {
				// 返回完整的响应，包含算法ID、密钥长度、模数和公钥指数等信息
				const algId = UKeyUtils.hexToInt(response.substring(8, 16));
				const len = UKeyUtils.hexToInt(response.substring(16, 24)) / 8;
				const modulus = response.substring(24 + 256 * 2 - len * 2, 24 + 256 * 2);
				const publicExponent = response.substring(24 + 256 * 2, 24 + 256 * 2 + 8);
				const genRSAResult: RSAKeyResult = {
					flag: false,
				};
				const publicKey = {
					algId: algId,
					len: len,
					modulus: modulus,
					publicExponent: publicExponent,
				};
				genRSAResult.flag = true;
				genRSAResult.publicKey = publicKey;
				newResponse.result = true;
				newResponse.response = JSON.stringify(genRSAResult);
			} else {
				newResponse.result = false;
				newResponse.response = 'GenRSAKeyPair error. checkCode failed';
			}
		} else {
			newResponse.response = 'GenRSAKeyPair error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 导入RSA密钥对
	 * @param conHandle 容器句柄
	 * @param algId 加密算法ID
	 * @param hexSessionKeyEncryptedData  包装的私钥数据（十六进制字符串）会话密钥的密文数据
	 * @param hexRsaPriKeyEncryptedData 加密的数据（十六进制字符串）RSA加密密钥对的私钥的密文数据)
	 */
	async importRSAKeyPair(
		conHandle: number,
		algId: AlgorithmId,
		hexSessionKeyEncryptedData: string,
		hexRsaPriKeyEncryptedData: string
	): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.importRSAKeyPair(
			conHandle,
			algId,
			hexSessionKeyEncryptedData,
			hexRsaPriKeyEncryptedData
		);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'ImportRSAKeyPair error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
				newResponse.response = 'ImportRSAKeyPair success';
			} else {
				newResponse.result = false;
				newResponse.response = 'ImportRSAKeyPair error. response != 0x00';
			}
		} else {
			newResponse.response = 'ImportRSAKeyPair error. ' + response;
		}
		return newResponse;
	}

	/**
	 * RSA签名
	 * @param conHandle 容器句柄
	 * @param hexData 待签名数据的十六进制字符串
	 */
	async rsaSignData(conHandle: number, hexData: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.rsaSignData(conHandle, hexData);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (UKeyUtils.checkCode(responseCode)) {
				const signLen = UKeyUtils.hexToInt(response.substring(8, 16));
				const signData = response.substring(16, 16 + signLen * 2);
				newResponse.result = true;
				newResponse.response = signData;
			} else {
				newResponse.result = false;
				newResponse.response = 'RSASignData error. checkCode failed';
			}
		} else {
			newResponse.response = 'RSASignData error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 导出RSA会话密钥
	 * @param conHandle 容器句柄
	 * @param algId 加密算法ID
	 * @param hexPubKey 公钥的十六进制字符串
	 */
	async rsaExportSessionKey(conHandle: number, algId: AlgorithmId, hexPubKey: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.rsaExportSessionKey(conHandle, algId, hexPubKey);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'RSAExportSessionKey error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
				newResponse.response = 'RSAExportSessionKey success';
			} else {
				newResponse.result = false;
				newResponse.response = 'RSAExportSessionKey error. response != 0x00';
			}
		} else {
			newResponse.response = 'RSAExportSessionKey error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 生成ECC密钥对
	 * @param conHandle 容器句柄
	 */
	async genECCKeyPair(conHandle: number): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.genECCKeyPair(conHandle);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (UKeyUtils.checkCode(responseCode)) {
				// 解析ECC公钥信息
				let index = 8;
				const bits = UKeyUtils.hexToInt(response.substring(index, index + 8));
				index += 8;
				const xX = response.substring(index, index + 128);
				index += 128;
				const yY = response.substring(index, index + 128);
				const eccPublicyKeyBlob: ECCPublicKeyBlob = { bits, x: xX, y: yY };

				newResponse.result = true;
				newResponse.response = JSON.stringify(eccPublicyKeyBlob);
			} else {
				newResponse.result = false;
				newResponse.response = 'GenECCKeyPair error. checkCode failed';
			}
		} else {
			newResponse.response = 'GenECCKeyPair error. ' + response;
		}
		return newResponse;
	}
	/**
	 * 导入ECC密钥对
	 * @param conHandle 容器句柄
	 * @param hexData 包含密钥对数据的十六进制字符
	 */
	async importECCKeyPair(conHandle: number, hexData: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.importECCKeyPair(conHandle, hexData);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'ImportECCKeyPair error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
				newResponse.response = 'ImportECCKeyPair success';
			} else {
				newResponse.result = false;
				newResponse.response = 'ImportECCKeyPair error. response != 0x00';
			}
		} else {
			newResponse.response = 'ImportECCKeyPair error. ' + response;
		}
		return newResponse;
	}

	/**
	 * ECC签名
	 * @param conHandle 容器句柄
	 * @param hexData 待签名数据的十六进制字符串
	 */
	async eccSignData(conHandle: number, hexData: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.eccSignData(conHandle, hexData);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (UKeyUtils.checkCode(responseCode)) {
				const r = response.substring(8, 8 + 64 * 2);
				const s = response.substring(8 + 64 * 2, 8 + 64 * 4);
				const signData = r.substring(64, 64 * 2) + s.substring(64, 64 * 2);
				newResponse.result = true;
				newResponse.response = JSON.stringify({ r, s, signData });
			} else {
				newResponse.result = false;
				newResponse.response = 'ECCSignData error. checkCode failed';
			}
		} else {
			newResponse.response = 'ECCSignData error. ' + response;
		}
		return newResponse;
	}

	/**
	 *
	 * 导出ECC(SM2)会话密钥
	 * @param conHandle 容器句柄
	 * @param algId 加密算法ID
	 * @param hexPubKey 公钥的十六进制字符串
	 */
	async eccExportSessionKey(conHandle: number, algId: AlgorithmId, hexPubKey: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.eccExportSessionKey(conHandle, algId, hexPubKey);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'ECCExportSessionKey error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
				newResponse.response = 'ECCExportSessionKey success';
			} else {
				newResponse.result = false;
				newResponse.response = 'ECCExportSessionKey error. response != 0x00';
			}
		} else {
			newResponse.response = 'ECCExportSessionKey error. ' + response;
		}
		return newResponse;
	}

	// 加密解密相关方法
	/**
	 * 初始化加密会话
	 * @param sessionKey 会话密钥句柄
	 * @param hexEncParam 加密参数的十六进制字符串
	 */
	async encryptInit(sessionKey: number, hexEncParam: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.encryptInit(sessionKey, hexEncParam);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'EncryptInit error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
				newResponse.response = 'EncryptInit success';
			} else {
				newResponse.result = false;
				newResponse.response = 'EncryptInit error. response != 0x00';
			}
		} else {
			newResponse.response = 'EncryptInit error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 加密数据
	 * @param sessionKey 会话密钥句柄
	 * @param hexData 待加密数据的十六进制字符串
	 */
	async encrypt(sessionKey: number, hexData: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.encrypt(sessionKey, hexData);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (UKeyUtils.checkCode(responseCode)) {
				const encLen = UKeyUtils.hexToInt(response.substring(8, 16));
				const encData = response.substring(16, 16 + encLen * 2);
				newResponse.result = true;
				newResponse.response = encData;
			} else {
				newResponse.result = false;
				newResponse.response = 'Encrypt error. checkCode failed';
			}
		} else {
			newResponse.response = 'Encrypt error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 加密数据 要配合encryptFinal使用
	 * @param sessionKey 会话密钥句柄
	 * @param hexData 待加密数据的十六进制字符串
	 */
	async encryptUpdate(sessionKey: number, hexData: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.encryptUpdate(sessionKey, hexData);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (UKeyUtils.checkCode(responseCode)) {
				const encLen = UKeyUtils.hexToInt(response.substring(8, 16));
				const encData = response.substring(16, 16 + encLen * 2);
				newResponse.result = true;
				newResponse.response = encData;
			} else {
				newResponse.result = false;
				newResponse.response = 'EncryptUpdate error. checkCode failed';
			}
		} else {
			newResponse.response = 'EncryptUpdate error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 加密数据完成 要配合encryptUpdate使用
	 * @param sessionKey 会话密钥句柄
	 */
	async encryptFinal(sessionKey: number): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.encryptFinal(sessionKey);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'EncryptFinal error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
				newResponse.response = 'EncryptFinal success';
			} else {
				newResponse.result = false;
				newResponse.response = 'EncryptFinal error. response != 0x00';
			}
		} else {
			newResponse.response = 'EncryptFinal error. ' + response;
		}
		return newResponse;
	}

	// 摘要计算相关方法
	/**
	 * 初始化摘要计算
	 * @param devHandle 设备句柄
	 * @param algId 摘要算法ID
	 * @param hexPubKey 公钥的十六进制字符串
	 * @param signerId 签名者ID
	 */
	async digestInit(devHandle: number, algId: HashAlgoId, hexPubKey: string, signerId: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.digestInit(devHandle, algId, hexPubKey, signerId);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (UKeyUtils.checkCode(responseCode)) {
				const hashHandle = UKeyUtils.hexToInt(response.substring(8, 16));
				newResponse.result = true;
				newResponse.response = JSON.stringify(hashHandle); // 返回句柄值
			} else {
				newResponse.result = false;
				newResponse.response = 'DigestInit error. checkCode failed';
			}
		} else {
			newResponse.response = 'DigestInit error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 摘要计算
	 * @param hashHandle 摘要句柄
	 * @param hexData 待摘要数据的十六进制字符串
	 */
	async digest(hashHandle: number, hexData: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.digest(hashHandle, hexData);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (UKeyUtils.checkCode(responseCode)) {
				const digestLen = UKeyUtils.hexToInt(response.substring(8, 16));
				const digest = response.substring(16, 16 + digestLen * 2);
				newResponse.result = true;
				newResponse.response = digest;
			} else {
				newResponse.result = false;
				newResponse.response = 'Digest error. checkCode failed';
			}
		} else {
			newResponse.response = 'Digest error. ' + response;
		}
		return newResponse;
	}
	/**
	 * 摘要计算完成 要配合digestUpdate使用
	 * @param hashHandle 摘要句柄
	 * @param hexData 待摘要数据的十六进制字符串
	 */
	async digestUpdate(hashHandle: number, hexData: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.digestUpdate(hashHandle, hexData);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'DigestUpdate error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
				newResponse.response = 'DigestUpdate success';
			} else {
				newResponse.result = false;
				newResponse.response = 'DigestUpdate error. response != 0x00';
			}
		} else {
			newResponse.response = 'DigestUpdate error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 摘要计算完成 要配合digestUpdate使用
	 * @param hashHandle 摘要句柄
	 */
	async digestFinal(hashHandle: number): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.digestFinal(hashHandle);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (UKeyUtils.checkCode(responseCode)) {
				const digestLen = UKeyUtils.hexToInt(response.substring(8, 16));
				const digestData = response.substring(16, 16 + digestLen * 2);
				newResponse.result = true;
				newResponse.response = digestData;
			} else {
				newResponse.result = false;
				newResponse.response = 'DigestFinal error. checkCode failed';
			}
		} else {
			newResponse.response = 'DigestFinal error. ' + response;
		}
		return newResponse;
	}

	// 通用方法
	/**
	 * 关闭句柄
	 * @param handle 句柄
	 */
	async closeHandle(handle: number): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.closeHandle(handle);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'CloseHandle error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
				newResponse.response = 'CloseHandle success';
			} else {
				newResponse.result = false;
				newResponse.response = 'CloseHandle error. response != 0x00';
			}
		} else {
			newResponse.response = 'CloseHandle error. ' + response;
		}
		return newResponse;
	}

	// 文件管理相关方法
	/**
	 * 枚举SK文件
	 * @param appHandle 应用句柄
	 */
	async enumSKFile(appHandle: number): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.enumSKFile(appHandle);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (responseCode == null) {
				newResponse.result = false;
				newResponse.response = 'EnumSKFile error. responseCode is null';
				return newResponse;
			}
			const size = UKeyUtils.hexToInt(response.substring(8, 16));
			if (size < 1) {
				newResponse.result = false;
				newResponse.response = 'EnumSKFile error. size < 1';
				return newResponse;
			}

			const resultStr = UKeyUtils.hexToAscii(response.substring(16, 16 + size * 2 - 2 * 2));
			if (resultStr == null) {
				newResponse.result = false;
				newResponse.response = 'EnumSKFile error. hexToAscii error';
			} else {
				const fileNameList = resultStr.split('\0');
				newResponse.result = true;
				newResponse.response = JSON.stringify(fileNameList);
			}
		} else {
			newResponse.response = 'EnumSKFile error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 删除SK文件
	 * @param appHandle 应用句柄
	 * @param fileName 文件名
	 */
	async deleteSKFile(appHandle: number, fileName: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.deleteSKFile(appHandle, fileName);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'DeleteSKFile error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
				newResponse.response = 'DeleteSKFile success';
			} else {
				newResponse.result = false;
				newResponse.response = 'DeleteSKFile error. response != 0x00';
			}
		} else {
			newResponse.response = 'DeleteSKFile error. ' + response;
		}
		return newResponse;
	}
	async getSKFileInfo(appHandle: number, fileName: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.getSKFileInfo(appHandle, fileName);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			if (responseCode == null) {
				newResponse.result = false;
				newResponse.response = 'GetSKFileInfo error. responseCode is null';
				return newResponse;
			}
			let indexStart = 0,
				indexEnd = 4 * 2;
			const ret = UKeyUtils.hexToInt(response.substring(indexStart, indexEnd));
			if (UKeyUtils.checkCode(ret)) {
				indexStart = indexEnd;
				indexEnd = indexStart + 32 * 2;
				const fileName = UKeyUtils.hexToAscii(response.substring(indexStart, indexEnd));
				indexStart = indexEnd;
				indexEnd = indexStart + 4 * 2;
				const fileSize = UKeyUtils.hexToInt(response.substring(indexStart, indexEnd));
				indexStart = indexEnd;
				indexEnd = indexStart + 4 * 2;
				const readRight = UKeyUtils.hexToInt(response.substring(indexStart, indexEnd));
				indexStart = indexEnd;
				indexEnd = indexStart + 4 * 2;
				const writeRight = UKeyUtils.hexToInt(response.substring(indexStart, indexEnd));

				// 生成权限描述
				let readRightDesc = '读权限:';
				if (readRight === 0) readRightDesc += '无权限 ';
				else if (readRight === 1) readRightDesc += 'ADMIN权限 ';
				else if (readRight === 16) readRightDesc += 'USER权限 ';
				else if (readRight === 255) readRightDesc += '任意权限 ';
				else readRightDesc += '未知权限 ';

				let writeRightDesc = '写权限:';
				if (writeRight === 0) writeRightDesc += '无权限 ';
				else if (writeRight === 1) writeRightDesc += 'ADMIN权限 ';
				else if (writeRight === 16) writeRightDesc += 'USER权限 ';
				else if (writeRight === 255) writeRightDesc += '任意权限 ';
				else writeRightDesc += '未知权限 ';

				const fileInfo = `文件名：${fileName}\n大小:${fileSize}字节\n${readRightDesc}\n${writeRightDesc}`;
				newResponse.result = true;
				newResponse.response = fileInfo;
			} else {
				newResponse.result = false;
				newResponse.response = 'GetSKFileInfo error. checkCode failed';
			}
		} else {
			newResponse.response = 'GetSKFileInfo error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 创建SK文件
	 * @param appHandle 应用句柄
	 * @param fileName 文件名
	 * @param fileSize 文件大小
	 * @param read 读权限
	 * @param ulFIleWRight 写权限
	 */
	async createSKFile(
		appHandle: number,
		fileName: string,
		fileSize: number,
		read: number,
		ulFIleWRight: number
	): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.createSKFile(
			appHandle,
			fileName,
			fileSize,
			read,
			ulFIleWRight
		);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'CreateSKFile error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
				newResponse.response = 'CreateSKFile success';
			} else {
				newResponse.result = false;
				newResponse.response = 'CreateSKFile error. response != 0x00';
			}
		} else {
			newResponse.response = 'CreateSKFile error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 读取SK文件
	 * @param appHandle 应用句柄
	 * @param fileName 文件名
	 * @param offset 偏移
	 * @param length 长度
	 */
	async readSKFile(appHandle: number, fileName: string, offset: number, length: number): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.readSKFile(appHandle, fileName, offset, length);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'ReadSKFile error. response is null';
			} else {
				const ret = UKeyUtils.hexToInt(response.substring(0, 8));
				if (UKeyUtils.checkCode(ret)) {
					const realReadSize = UKeyUtils.hexToInt(response.substring(8, 16));
					const realReadData = response.substring(16, 16 + realReadSize * 2);
					newResponse.result = true;
					newResponse.response = realReadData;
				} else {
					newResponse.result = false;
					newResponse.response = 'ReadSKFile error. checkCode failed';
				}
			}
		} else {
			newResponse.response = 'ReadSKFile error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 写SK文件
	 * @param appHandle 应用句柄
	 * @param fileName 文件名
	 * @param offset 偏移
	 * @param data 数据
	 */
	async writeSKFile(appHandle: number, fileName: string, offset: number, data: string): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.writeSKFile(appHandle, fileName, offset, data);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'WriteSKFile error. response is null';
			} else if (UKeyUtils.checkCode(response.toString())) {
				newResponse.result = true;
				newResponse.response = 'WriteSKFile success';
			} else {
				newResponse.result = false;
				newResponse.response = 'WriteSKFile error. response != 0x00';
			}
		} else {
			newResponse.response = 'WriteSKFile error. ' + response;
		}
		return newResponse;
	}

	/**
	 * 生成随机数
	 * @param devHandle 设备句柄
	 * @param length 长度
	 */
	async genRandomData(devHandle: number, length: number): Promise<UKeyResponse> {
		const ukeyResponse = await this.ukeyWebSocketClient.genRandomData(devHandle, length);
		const newResponse: UKeyResponse = {
			...ukeyResponse,
		};
		const { result, response } = ukeyResponse;
		if (result) {
			if (response == null) {
				newResponse.result = false;
				newResponse.response = 'GenRandomData error. response is null';
			} else {
				const ret = UKeyUtils.hexToInt(response.substring(0, 8));
				if (UKeyUtils.checkCode(ret)) {
					const genSize = UKeyUtils.hexToInt(response.substring(8, 16));
					const genData = response.substring(16, 16 + genSize * 2);
					newResponse.result = true;
					newResponse.response = genData;
				} else {
					newResponse.result = false;
					newResponse.response = 'GenRandomData error. checkCode failed';
				}
			}
		} else {
			newResponse.response = 'GenRandomData error. ' + response;
		}
		return newResponse;
	}
}

export { UKeyClient };
