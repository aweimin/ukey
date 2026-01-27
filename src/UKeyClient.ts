import { getErrorCodeByCode, getErrorCodeByHexString, isSuccessCode } from './ErrorCode';
import { UKeyUtils } from './UKeyUtils';
import { UKeyWebSocketClient } from './UKeyWebSocketClient';
import { AlgorithmId, HashAlgId } from './constants';
import {
	ContainerType,
	DevInfo,
	EccCipherBlob,
	EccPublicKeyBlob,
	EccSessionKey,
	EccSignatureBlob,
	FileAttribute,
	RSAKeyLength,
	RsaPublicKeyBlob,
	RsaSessionKey,
	UKeyError,
	UKeyErrorResponse,
	UKeyPinError,
	UKeyPinErrorResponse,
	UKeyPinResponse,
	UKeyResponse,
	UKeySuccessResponse,
	UKeyWebSocketResponse,
} from './types';

const getDefaultErrorCode = (): UKeyError => {
	return {
		code: 0x0a000001,
		value: '0a000001',
		message: '',
		messageId: 'sar_fail',
	};
};

class UKeyClient {
	private readonly ukeyWebSocketClient: UKeyWebSocketClient;
	private readonly clsid: string;
	public onclose: ((event: CloseEvent) => any) | null = null;
	public onerror: ((event: Event) => any) | null = null;

	constructor(clsid: string) {
		this.clsid = clsid;
		this.ukeyWebSocketClient = new UKeyWebSocketClient(clsid);
		this.ukeyWebSocketClient.onclose = (event: CloseEvent) => {
			if (this.onclose) {
				this.onclose(event);
			}
		};
		this.ukeyWebSocketClient.onerror = (event: Event) => {
			if (this.onerror) {
				this.onerror(event);
			}
		};
	}

	/**
	 * 初始化
	 * @param wsUrl WebSocket地址 wss://127.0.0.1:1237
	 */
	async init(wsUrl: string = 'wss://127.0.0.1:1237'): Promise<void> {
		return this.ukeyWebSocketClient.init(wsUrl);
	}
	/**
	 * 加载模块
	 */
	async loadModule(): Promise<UKeyWebSocketResponse> {
		return this.ukeyWebSocketClient.loadModule();
	}

	// 设备管理相关方法
	/**
	 * 枚举设备
	 * @param bPresent 是否只返回已连接的设备
	 * @returns Promise<UKeyResponse<string[]>>
	 */
	async enumDev(bPresent: boolean): Promise<UKeyResponse<string[]>> {
		const ukeyResponse = await this.ukeyWebSocketClient.enumDev(bPresent);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const size = UKeyUtils.hexToInt(response.substring(8, 16));
			if (size < 1) {
				error.message = 'EnumDev error. ' + 'size < 1';
				return faultResponse;
			}

			const resultStr = UKeyUtils.hexToAscii(response.substring(16, 16 + size * 2 - 2 * 2));
			if (resultStr == null) {
				error.message = 'EnumDev error. ' + 'hexToAscii error';
			} else {
				const devNameList = resultStr.split('\0');
				if (devNameList.length < 1) {
					error.message = 'EnumDev error. ' + 'l_DevNameList.length < 1';
				} else {
					const successResponse: UKeySuccessResponse<string[]> = {
						...ukeyResponse,
						success: true,
						data: devNameList,
					};
					return successResponse;
				}
			}
		} else {
			error.message = 'EnumDev error. ';
		}
		return faultResponse;
	}

	/**
	 * 连接设备
	 * @param devName 设备名称
	 * @returns Promise<UKeyResponse<number>>
	 */
	async connectDev(devName: string): Promise<UKeyResponse<number>> {
		const ukeyResponse = await this.ukeyWebSocketClient.connectDev(devName);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const ret = UKeyUtils.hexToInt(response.substring(0, 8));
			if (UKeyUtils.checkCode(ret)) {
				const handle = UKeyUtils.hexToInt(response.substring(8, 16));
				const successResponse: UKeySuccessResponse<number> = {
					...ukeyResponse,
					success: true,
					data: handle,
				};
				return successResponse;
			} else {
				error.message = 'ConnectDev error. ' + 'ret != 0x00';
			}
		} else {
			error.message = 'ConnectDev error. ';
		}
		return faultResponse;
	}
	/**
	 * 断开设备连接
	 * @param devHandle 设备句柄
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async disConnectDev(devHandle: number): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.disConnectDev(devHandle);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };

		if (result) {
			if (UKeyUtils.checkCode(response.toString())) {
				const successResponse: UKeySuccessResponse<boolean> = {
					...ukeyResponse,
					success: true,
					data: true,
				};
				return successResponse;
			} else {
				//response 是一个10进制数。
				//167772165 ->0x0a000005
				const errorCode = getErrorCodeByCode(Number.parseInt(response));
				if (errorCode && !isSuccessCode(errorCode.code)) {
					error.code = errorCode.code;
					error.message = errorCode.description;
					error.messageId = errorCode.messageId;
					error.value = errorCode.value;
					return faultResponse;
				}
			}
		} else {
			error.message = 'DisconnectDev error. ';
		}
		return faultResponse;
	}

	/**
	 * 设置设备标签
	 * @param devHandle 设备句柄
	 * @param label 标签
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async setLabel(devHandle: number, label: string): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.setLabel(devHandle, label);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			if (UKeyUtils.checkCode(response.toString())) {
				const successResponse: UKeySuccessResponse<boolean> = {
					...ukeyResponse,
					success: true,
					data: true,
				};
				return successResponse;
			} else {
				//response 是一个10进制数。
				//167772165 ->0x0a000005
				const errorCode = getErrorCodeByCode(Number.parseInt(response));
				if (errorCode && !isSuccessCode(errorCode.code)) {
					error.code = errorCode.code;
					error.message = errorCode.description;
					error.messageId = errorCode.messageId;
					error.value = errorCode.value;
					return faultResponse;
				}
			}
		} else {
			error.message = 'SetLabel error. ';
		}
		return faultResponse;
	}

	/**
	 * 获取设备信息
	 * @param devHandle 设备句柄
	 * @returns Promise<UKeyResponse<DevInfo>>
	 */
	async getDevInfo(devHandle: number): Promise<UKeyResponse<DevInfo>> {
		const ukeyResponse = await this.ukeyWebSocketClient.getDevInfo(devHandle);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}

			const devInfo = response;
			if (devInfo == null || devInfo.length < 332) {
				error.message = 'GetDevInfo error. Invalid response length';
			} else {
				const label = UKeyUtils.hexToAscii(devInfo.substring(268, 332));
				const serialNumber = UKeyUtils.hexToAscii(devInfo.substring(332, 396));

				const successResponse: UKeySuccessResponse<DevInfo> = {
					...ukeyResponse,
					success: true,
					data: {
						label,
						serialNumber,
					},
				};
				return successResponse;
			}
		} else {
			error.message = 'GetDevInfo error. ';
		}
		return faultResponse;
	}

	// 应用管理相关方法
	/**
	 * 枚举应用
	 * @param devHandle 设备句柄
	 * @returns Promise<UKeyResponse<string[]>>
	 */
	async enumApplication(devHandle: number): Promise<UKeyResponse<string[]>> {
		const ukeyResponse = await this.ukeyWebSocketClient.enumApplication(devHandle);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const size = UKeyUtils.hexToInt(response.substring(8, 16));
			if (size < 1) {
				error.message = 'EnumApplication error. size < 1';
				return faultResponse;
			}

			const resultStr = UKeyUtils.hexToAscii(response.substring(16, 16 + size * 2 - 2 * 2));
			if (resultStr == null) {
				error.message = 'EnumApplication error. hexToAscii error';
			} else {
				const appNameList = resultStr.split('\0');
				if (appNameList.length < 1) {
					error.message = 'EnumApplication error. appNameList.length < 1';
				} else {
					const successResponse: UKeySuccessResponse<string[]> = {
						...ukeyResponse,
						success: true,
						data: appNameList,
					};
					return successResponse;
				}
			}
		} else {
			error.message = 'EnumApplication error. ';
		}
		return faultResponse;
	}

	/**
	 * 打开应用
	 * @param devHandle 设备句柄
	 * @param appName 应用名称
	 * @returns Promise<UKeyResponse<number>>
	 */
	async openApplication(devHandle: number, appName: string): Promise<UKeyResponse<number>> {
		const ukeyResponse = await this.ukeyWebSocketClient.openApplication(devHandle, appName);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}

			const ret = UKeyUtils.hexToInt(response.substring(0, 8));
			if (UKeyUtils.checkCode(ret)) {
				const handle = UKeyUtils.hexToInt(response.substring(8, 16));
				const successResponse: UKeySuccessResponse<number> = {
					...ukeyResponse,
					success: true,
					data: handle,
				};
				return successResponse;
			} else {
				error.message = 'OpenApplication error. checkCode failed';
			}
		} else {
			error.message = 'OpenApplication error. ';
		}
		return faultResponse;
	}
	/**
	 * 验证PIN
	 * @param appHandle 应用句柄
	 * @param pinType PIN类型 1-用户PIN 0-管理员PIN
	 * @param pinValue PIN值
	 * @returns Promise<UKeyPinResponse<boolean>>
	 */
	async verifyPIN(appHandle: number, pinType: number, pinValue: string): Promise<UKeyPinResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.verifyPIN(appHandle, pinType, pinValue);
		const { result, response } = ukeyResponse;
		const error: UKeyPinError = {
			...getDefaultErrorCode(),
			remainingAttempts: 0,
		};

		const faultResponse: UKeyPinErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response); //0x0a000024 pin不正常
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				const remainingAttempts = UKeyUtils.hexToInt(response.substring(8, 16));
				error.remainingAttempts = Number.isNaN(remainingAttempts) ? 0 : remainingAttempts;
				return faultResponse;
			}
			const successResponse: UKeySuccessResponse<boolean> = {
				...ukeyResponse,
				success: true,
				data: true,
			};
			return successResponse;
		} else {
			error.message = 'VerifyPIN error. ';
		}
		return faultResponse;
	}
	/**
	 * 修改PIN
	 * @param appHandle 应用句柄
	 * @param pinType PIN类型 1-用户PIN 0-管理员PIN
	 * @param oldPinValue 旧PIN值
	 * @param newPinValue 新PIN值
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async changePIN(
		appHandle: number,
		pinType: number,
		oldPinValue: string,
		newPinValue: string
	): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.changePIN(appHandle, pinType, oldPinValue, newPinValue);
		const { result, response } = ukeyResponse;
		const error: UKeyPinError = {
			...getDefaultErrorCode(),
			remainingAttempts: 0,
		};

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response); //0x0a000024 pin不正常
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				const remainingAttempts = UKeyUtils.hexToInt(response.substring(8, 16));
				error.remainingAttempts = Number.isNaN(remainingAttempts) ? 0 : remainingAttempts;
				return faultResponse;
			}

			const successResponse: UKeySuccessResponse<boolean> = {
				...ukeyResponse,
				success: true,
				data: true,
			};
			return successResponse;
		} else {
			error.message = 'ChangePIN error. ';
		}
		return faultResponse;
	}

	/**
	 * 关闭应用
	 * @param appHandle 应用句柄
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async closeApplication(appHandle: number): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.closeApplication(appHandle);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			if (UKeyUtils.checkCode(response.toString())) {
				const successResponse: UKeySuccessResponse<boolean> = {
					...ukeyResponse,
					success: true,
					data: true,
				};
				return successResponse;
			} else {
				//response 是一个10进制数。
				//167772165 ->0x0a000005
				const errorCode = getErrorCodeByCode(Number.parseInt(response));
				if (errorCode && !isSuccessCode(errorCode.code)) {
					error.code = errorCode.code;
					error.message = errorCode.description;
					error.messageId = errorCode.messageId;
					error.value = errorCode.value;
					return faultResponse;
				}
			}
		} else {
			error.message = 'CloseApplication error. ';
		}
		return faultResponse;
	}

	// 容器管理相关方法
	/**
	 * 枚举容器
	 * @param appHandle 应用句柄
	 * @returns Promise<UKeyResponse<string[]>>
	 */
	async enumContainer(appHandle: number): Promise<UKeyResponse<string[]>> {
		const ukeyResponse = await this.ukeyWebSocketClient.enumContainer(appHandle);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const size = UKeyUtils.hexToInt(response.substring(8, 16));
			if (size < 1) {
				error.message = 'EnumContainer error. size < 1';
				return faultResponse;
			}

			const resultStr = UKeyUtils.hexToAscii(response.substring(16, 16 + size * 2 - 2 * 2));
			if (resultStr == null) {
				error.message = 'EnumContainer error. hexToAscii error';
			} else {
				const containerNameList = resultStr.split('\0');
				if (containerNameList.length < 1) {
					error.message = 'EnumContainer error. containerNameList.length < 1';
				} else {
					const successResponse: UKeySuccessResponse<string[]> = {
						...ukeyResponse,
						success: true,
						data: containerNameList,
					};
					return successResponse;
				}
			}
		} else {
			error.message = 'EnumContainer error. ';
		}
		return faultResponse;
	}

	/**
	 * 创建容器
	 * @param appHandle 应用句柄
	 * @param conName 容器名称
	 * @returns Promise<UKeyResponse<number>>
	 */
	async createContainer(appHandle: number, conName: string): Promise<UKeyResponse<number>> {
		const ukeyResponse = await this.ukeyWebSocketClient.createContainer(appHandle, conName);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}

			const ret = UKeyUtils.hexToInt(response.substring(0, 8));
			if (UKeyUtils.checkCode(ret)) {
				const handle = UKeyUtils.hexToInt(response.substring(8, 16));
				const successResponse: UKeySuccessResponse<number> = {
					...ukeyResponse,
					success: true,
					data: handle,
				};
				return successResponse;
			} else {
				error.message = 'CreateContainer error. checkCode failed';
			}
		} else {
			error.message = 'CreateContainer error. ';
		}
		return faultResponse;
	}

	/**
	 * 删除容器
	 * @param appHandle 应用句柄
	 * @param conName 容器名称
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async deleteContainer(appHandle: number, conName: string): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.deleteContainer(appHandle, conName);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			if (UKeyUtils.checkCode(response.toString())) {
				const successResponse: UKeySuccessResponse<boolean> = {
					...ukeyResponse,
					success: true,
					data: true,
				};
				return successResponse;
			} else {
				//response 是一个10进制数。
				//167772165 ->0x0a000005
				const errorCode = getErrorCodeByCode(Number.parseInt(response));
				if (errorCode && !isSuccessCode(errorCode.code)) {
					error.code = errorCode.code;
					error.message = errorCode.description;
					error.messageId = errorCode.messageId;
					error.value = errorCode.value;
					return faultResponse;
				}
			}
		} else {
			error.message = 'DeleteContainer error. ';
		}
		return faultResponse;
	}

	/**
	 * 打开容器
	 * @param appHandle 应用句柄
	 * @param conName 容器名称
	 * @returns Promise<UKeyResponse<number>>
	 */
	async openContainer(appHandle: number, conName: string): Promise<UKeyResponse<number>> {
		const ukeyResponse = await this.ukeyWebSocketClient.openContainer(appHandle, conName);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}

			const ret = UKeyUtils.hexToInt(response.substring(0, 8));
			if (UKeyUtils.checkCode(ret)) {
				const handle = UKeyUtils.hexToInt(response.substring(8, 16));
				const successResponse: UKeySuccessResponse<number> = {
					...ukeyResponse,
					success: true,
					data: handle,
				};
				return successResponse;
			} else {
				error.message = 'OpenContainer error. checkCode failed';
			}
		} else {
			error.message = 'OpenContainer error. ';
		}
		return faultResponse;
	}

	/**
	 * 关闭容器
	 * @param conHandle 容器句柄
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async closeContainer(conHandle: number): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.closeContainer(conHandle);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			if (UKeyUtils.checkCode(response.toString())) {
				const successResponse: UKeySuccessResponse<boolean> = {
					...ukeyResponse,
					success: true,
					data: true,
				};
				return successResponse;
			} else {
				//response 是一个10进制数。
				//167772165 ->0x0a000005
				const errorCode = getErrorCodeByCode(Number.parseInt(response));
				if (errorCode && !isSuccessCode(errorCode.code)) {
					error.code = errorCode.code;
					error.message = errorCode.description;
					error.messageId = errorCode.messageId;
					error.value = errorCode.value;
					return faultResponse;
				}
			}
		} else {
			error.message = 'CloseContainer error. ';
		}
		return faultResponse;
	}

	/**
	 * 获取容器类型
	 * @param conHandle 容器句柄
	 * @returns Promise<UKeyResponse<ContainerType>>
	 */
	async getContainerType(conHandle: number): Promise<UKeyResponse<ContainerType>> {
		const ukeyResponse = await this.ukeyWebSocketClient.getContainerType(conHandle);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
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
				const successResponse: UKeySuccessResponse<ContainerType> = {
					...ukeyResponse,
					success: true,
					data: {
						type: typeValue,
						label: typeDesc,
					},
				};
				return successResponse;
			} else {
				error.message = 'GetContainerType error. checkCode failed';
			}
		} else {
			error.message = 'GetContainerType error. ';
		}
		return faultResponse;
	}

	// 证书管理相关方法
	/**
	 * 导入证书
	 * @param conHandle 容器句柄
	 * @param keyType true表示签名证书，false表示加密证书
	 * @param hexCert 证书内容
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async importCertificate(conHandle: number, keyType: boolean, hexCert: string): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.importCertificate(conHandle, keyType, hexCert);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			if (UKeyUtils.checkCode(response.toString())) {
				const successResponse: UKeySuccessResponse<boolean> = {
					...ukeyResponse,
					success: true,
					data: true,
				};
				return successResponse;
			} else {
				//response 是一个10进制数。
				//167772165 ->0x0a000005
				const errorCode = getErrorCodeByCode(Number.parseInt(response));
				if (errorCode && !isSuccessCode(errorCode.code)) {
					error.code = errorCode.code;
					error.message = errorCode.description;
					error.messageId = errorCode.messageId;
					error.value = errorCode.value;
					return faultResponse;
				}
			}
		} else {
			error.message = 'ImportCertificate error. ';
		}
		return faultResponse;
	}

	/**
	 * 导出证书
	 * @param conHandle 容器句柄
	 * @param keyType true表示签名证书，false表示加密证书
	 * @returns Promise<UKeyResponse<string>>
	 */
	async exportCertificate(conHandle: number, keyType: boolean): Promise<UKeyResponse<string>> {
		const ukeyResponse = await this.ukeyWebSocketClient.exportCertificate(conHandle, keyType);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const size = UKeyUtils.hexToInt(response.substring(8, 16));
			if (size < 1) {
				error.message = 'ExportCertificate error. size < 1';
				return faultResponse;
			}

			const cert = response.substring(16, 16 + size * 2);
			const successResponse: UKeySuccessResponse<string> = {
				...ukeyResponse,
				success: true,
				data: cert,
			};
			return successResponse;
		} else {
			error.message = 'ExportCertificate error. ';
		}
		return faultResponse;
	}

	/**
	 * 导出公钥
	 * @param conHandle 容器句柄
	 * @param keyType true表示签名公钥，false表示加密公钥
	 * @returns Promise<UKeyResponse<string>>
	 */
	async exportPublicKey(conHandle: number, keyType: boolean): Promise<UKeyResponse<string>> {
		const ukeyResponse = await this.ukeyWebSocketClient.exportPublicKey(conHandle, keyType);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const pubKeyLen = UKeyUtils.hexToInt(response.substring(8, 16));
			const pubKey = response.substring(16, 16 + pubKeyLen * 2);
			const successResponse: UKeySuccessResponse<string> = {
				...ukeyResponse,
				success: true,
				data: pubKey,
			};
			return successResponse;
		} else {
			error.message = 'ExportPublicKey error. ';
		}
		return faultResponse;
	}

	// 密钥生成相关方法
	/**
	 * 生成RSA密钥对
	 * @param conHandle 容器句柄
	 * @param bitLength 密钥长度
	 * @returns Promise<UKeyResponse<RsaPublicKeyBlob>>
	 */
	async genRSAKeyPair(conHandle: number, bitLength: RSAKeyLength): Promise<UKeyResponse<RsaPublicKeyBlob>> {
		const ukeyResponse = await this.ukeyWebSocketClient.genRSAKeyPair(conHandle, bitLength);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			// 返回完整的响应，包含算法ID、密钥长度、模数和公钥指数等信息
			const algId = UKeyUtils.hexToInt(response.substring(8, 16));
			const len = UKeyUtils.hexToInt(response.substring(16, 24)) / 8;
			const modulus = response.substring(24 + 256 * 2 - len * 2, 24 + 256 * 2);
			const publicExponent = response.substring(24 + 256 * 2, 24 + 256 * 2 + 8);
			const publicKeyBlob: RsaPublicKeyBlob = {
				algId: algId,
				bitLen: len,
				modulus: modulus,
				publicExponent: publicExponent,
			};

			const successResponse: UKeySuccessResponse<RsaPublicKeyBlob> = {
				...ukeyResponse,
				success: true,
				data: publicKeyBlob,
			};
			return successResponse;
		} else {
			error.message = 'GenRSAKeyPair error. ';
		}
		return faultResponse;
	}

	/**
	 * 导入RSA密钥对
	 * @param conHandle 容器句柄
	 * @param algId 加密算法ID
	 * @param hexSessionKeyEncryptedData  包装的私钥数据（十六进制字符串）会话密钥的密文数据
	 * @param hexRsaPriKeyEncryptedData 加密的数据（十六进制字符串）RSA加密密钥对的私钥的密文数据)
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async importRSAKeyPair(
		conHandle: number,
		algId: AlgorithmId,
		hexSessionKeyEncryptedData: string,
		hexRsaPriKeyEncryptedData: string
	): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.importRSAKeyPair(
			conHandle,
			algId,
			hexSessionKeyEncryptedData,
			hexRsaPriKeyEncryptedData
		);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			if (UKeyUtils.checkCode(response.toString())) {
				const successResponse: UKeySuccessResponse<boolean> = {
					...ukeyResponse,
					success: true,
					data: true,
				};
				return successResponse;
			} else {
				//response 是一个10进制数。
				//167772165 ->0x0a000005
				const errorCode = getErrorCodeByCode(Number.parseInt(response));
				if (errorCode && !isSuccessCode(errorCode.code)) {
					error.code = errorCode.code;
					error.message = errorCode.description;
					error.messageId = errorCode.messageId;
					error.value = errorCode.value;
					return faultResponse;
				}
			}
		} else {
			error.message = 'ImportRSAKeyPair error. ';
		}
		return faultResponse;
	}

	/**
	 * RSA签名
	 * @param conHandle 容器句柄
	 * @param hexData 待签名数据的十六进制字符串
	 * @returns Promise<UKeyResponse<string>>
	 */
	async rsaSignData(conHandle: number, hexData: string): Promise<UKeyResponse<string>> {
		const ukeyResponse = await this.ukeyWebSocketClient.rsaSignData(conHandle, hexData);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}

			const signLen = UKeyUtils.hexToInt(response.substring(8, 16));
			const signData = response.substring(16, 16 + signLen * 2);
			const successResponse: UKeySuccessResponse<string> = {
				...ukeyResponse,
				success: true,
				data: signData,
			};
			return successResponse;
		} else {
			error.message = 'RSASignData error. ';
		}
		return faultResponse;
	}

	/**
	 * 导出RSA会话密钥
	 * @param conHandle 容器句柄
	 * @param algId 加密算法ID
	 * @param hexPubKey 公钥的十六进制字符串
	 * @returns Promise<UKeyResponse<RsaSessionKey>>
	 */
	async rsaExportSessionKey(
		conHandle: number,
		algId: AlgorithmId,
		hexPubKey: string
	): Promise<UKeyResponse<RsaSessionKey>> {
		const ukeyResponse = await this.ukeyWebSocketClient.rsaExportSessionKey(conHandle, algId, hexPubKey);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			if (UKeyUtils.checkCode(response.toString())) {
				let index = 8;
				const sessionKey = UKeyUtils.hexToInt(response.substring(index, index + 8));
				index += 8;
				const datalen = UKeyUtils.hexToInt(response.substring(index, index + 8));
				index += 8;
				const cipher = response.substring(index, index + datalen * 2);
				const successResponse: UKeySuccessResponse<RsaSessionKey> = {
					...ukeyResponse,
					success: true,
					data: { sessionKey, cipher },
				};
				return successResponse;
			} else {
				error.message = 'RSAExportSessionKey error. response != 0x00';
			}
		} else {
			error.message = 'RSAExportSessionKey error. ';
		}
		return faultResponse;
	}

	/**
	 * 生成ECC密钥对
	 * @param conHandle 容器句柄
	 * @returns Promise<UKeyResponse<EccPublicKeyBlob>>
	 */
	async genECCKeyPair(conHandle: number): Promise<UKeyResponse<EccPublicKeyBlob>> {
		const ukeyResponse = await this.ukeyWebSocketClient.genECCKeyPair(conHandle);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			// 解析ECC公钥信息
			let index = 8;
			const bitLen = UKeyUtils.hexToInt(response.substring(index, index + 8));
			index += 8;
			const xCoordinate = response.substring(index, index + 128);
			index += 128;
			const yCoordinate = response.substring(index, index + 128);
			const eccPublicyKeyBlob: EccPublicKeyBlob = { bitLen, xCoordinate, yCoordinate };

			error.message = JSON.stringify(eccPublicyKeyBlob);
			const successResponse: UKeySuccessResponse<EccPublicKeyBlob> = {
				...ukeyResponse,
				success: true,
				data: eccPublicyKeyBlob,
			};
			return successResponse;
		} else {
			error.message = 'GenECCKeyPair error. ';
		}
		return faultResponse;
	}
	/**
	 * 导入ECC密钥对
	 * @param conHandle 容器句柄
	 * @param hexData 包含密钥对数据的十六进制字符
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async importECCKeyPair(conHandle: number, hexData: string): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.importECCKeyPair(conHandle, hexData);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			if (UKeyUtils.checkCode(response.toString())) {
				const successResponse: UKeySuccessResponse<boolean> = {
					...ukeyResponse,
					success: true,
					data: true,
				};
				return successResponse;
			} else {
				//response 是一个10进制数。
				//167772165 ->0x0a000005
				const errorCode = getErrorCodeByCode(Number.parseInt(response));
				if (errorCode && !isSuccessCode(errorCode.code)) {
					error.code = errorCode.code;
					error.message = errorCode.description;
					error.messageId = errorCode.messageId;
					error.value = errorCode.value;
					return faultResponse;
				}
			}
		} else {
			error.message = 'ImportECCKeyPair error. ';
		}
		return faultResponse;
	}

	/**
	 * ECC签名
	 * @param conHandle 容器句柄
	 * @param hexData 待签名数据的十六进制字符串
	 * @returns Promise<UKeyResponse<EccSignatureBlob>>
	 */
	async eccSignData(conHandle: number, hexData: string): Promise<UKeyResponse<EccSignatureBlob>> {
		const ukeyResponse = await this.ukeyWebSocketClient.eccSignData(conHandle, hexData);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const r = response.substring(8, 8 + 64 * 2);
			const s = response.substring(8 + 64 * 2, 8 + 64 * 4);
			const signData = r.substring(64, 64 * 2) + s.substring(64, 64 * 2);
			const successResponse: UKeySuccessResponse<EccSignatureBlob> = {
				...ukeyResponse,
				success: true,
				data: { r, s, signature: signData },
			};
			return successResponse;
		} else {
			error.message = 'ECCSignData error. ';
		}
		return faultResponse;
	}

	/**
	 *
	 * 导出ECC(SM2)会话密钥
	 * @param conHandle 容器句柄
	 * @param algId 加密算法ID
	 * @param hexPubKey 公钥的十六进制字符串
	 * @returns Promise<UKeyResponse<EccSessionKey>>
	 */
	async eccExportSessionKey(
		conHandle: number,
		algId: AlgorithmId,
		hexPubKey: string
	): Promise<UKeyResponse<EccSessionKey>> {
		const ukeyResponse = await this.ukeyWebSocketClient.eccExportSessionKey(conHandle, algId, hexPubKey);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			let index = 8;
			const sessionKey = UKeyUtils.hexToInt(response.substring(index, index + 8));
			index += 8;
			const x = response.substring(index, index + 128);
			index += 128;

			const y = response.substring(index, index + 128);
			index += 128;

			const hash = response.substring(index, index + 64);
			index += 64;

			const len = UKeyUtils.hexToInt(response.substring(index, index + 8));
			index += 8;
			const cipher = response.substring(index, index + len * 2);

			const cipherBlob: EccCipherBlob = {
				xCoordinate: x,
				yCoordinate: y,
				hash: hash,
				cipherLen: len,
				cipher: cipher,
			};
			const successResponse: UKeySuccessResponse<EccSessionKey> = {
				...ukeyResponse,
				success: true,
				data: { sessionKey, cipherBlob },
			};
			return successResponse;
		} else {
			error.message = 'ECCExportSessionKey error. ';
		}
		return faultResponse;
	}

	// 加密解密相关方法
	/**
	 * 初始化加密会话
	 * @param sessionKey 会话密钥句柄
	 * @param hexEncParam 加密参数的十六进制字符串
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async encryptInit(sessionKey: number, hexEncParam: string): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.encryptInit(sessionKey, hexEncParam);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			if (UKeyUtils.checkCode(response.toString())) {
				const successResponse: UKeySuccessResponse<boolean> = {
					...ukeyResponse,
					success: true,
					data: true,
				};
				return successResponse;
			} else {
				//response 是一个10进制数。
				//167772165 ->0x0a000005
				const errorCode = getErrorCodeByCode(Number.parseInt(response));
				if (errorCode && !isSuccessCode(errorCode.code)) {
					error.code = errorCode.code;
					error.message = errorCode.description;
					error.messageId = errorCode.messageId;
					error.value = errorCode.value;
					return faultResponse;
				}
			}
		} else {
			error.message = 'EncryptInit error. ';
		}
		return faultResponse;
	}

	/**
	 * 加密数据
	 * @param sessionKey 会话密钥句柄
	 * @param hexData 待加密数据的十六进制字符串
	 * @returns Promise<UKeyResponse<string>>
	 */
	async encrypt(sessionKey: number, hexData: string): Promise<UKeyResponse<string>> {
		const ukeyResponse = await this.ukeyWebSocketClient.encrypt(sessionKey, hexData);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const encLen = UKeyUtils.hexToInt(response.substring(8, 16));
			const encData = response.substring(16, 16 + encLen * 2);
			error.message = encData;
			const successResponse: UKeySuccessResponse<string> = {
				...ukeyResponse,
				success: true,
				data: encData,
			};
			return successResponse;
		} else {
			error.message = 'Encrypt error. ';
		}
		return faultResponse;
	}

	/**
	 * 加密数据 要配合encryptFinal使用
	 * @param sessionKey 会话密钥句柄
	 * @param hexData 待加密数据的十六进制字符串
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async encryptUpdate(sessionKey: number, hexData: string): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.encryptUpdate(sessionKey, hexData);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();
		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const successResponse: UKeySuccessResponse<boolean> = {
				...ukeyResponse,
				success: true,
				data: true,
			};
			return successResponse;
		} else {
			error.message = 'EncryptUpdate error. ';
		}
		return faultResponse;
	}

	/**
	 * 加密数据完成 要配合encryptUpdate使用
	 * @param sessionKey 会话密钥句柄
	 * @returns Promise<UKeyResponse<string>>
	 */
	async encryptFinal(sessionKey: number): Promise<UKeyResponse<string>> {
		const ukeyResponse = await this.ukeyWebSocketClient.encryptFinal(sessionKey);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const encLen = UKeyUtils.hexToInt(response.substring(8, 16));
			const encData = response.substring(16, 16 + encLen * 2);
			const successResponse: UKeySuccessResponse<string> = {
				...ukeyResponse,
				success: true,
				data: encData,
			};
			return successResponse;
		} else {
			error.message = 'EncryptFinal error. ';
		}
		return faultResponse;
	}

	// 摘要计算相关方法
	/**
	 * 初始化摘要计算
	 * @param devHandle 设备句柄
	 * @param algId 摘要算法ID
	 * @param hexPubKey 公钥的十六进制字符串
	 * @param signerId 签名者ID
	 * @returns Promise<UKeyResponse<number>>
	 */
	async digestInit(
		devHandle: number,
		algId: HashAlgId,
		hexPubKey: string,
		signerId: string
	): Promise<UKeyResponse<number>> {
		const ukeyResponse = await this.ukeyWebSocketClient.digestInit(devHandle, algId, hexPubKey, signerId);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const hashHandle = UKeyUtils.hexToInt(response.substring(8, 16));
			const successResponse: UKeySuccessResponse<number> = {
				...ukeyResponse,
				success: true,
				data: hashHandle, // 返回句柄值
			};
			return successResponse;
		} else {
			error.message = 'DigestInit error. ';
		}
		return faultResponse;
	}

	/**
	 * 摘要计算
	 * @param hashHandle 摘要句柄
	 * @param hexData 待摘要数据的十六进制字符串
	 * @returns Promise<UKeyResponse<string>>
	 */
	async digest(hashHandle: number, hexData: string): Promise<UKeyResponse<string>> {
		const ukeyResponse = await this.ukeyWebSocketClient.digest(hashHandle, hexData);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const digestLen = UKeyUtils.hexToInt(response.substring(8, 16));
			const digest = response.substring(16, 16 + digestLen * 2);
			const successResponse: UKeySuccessResponse<string> = {
				...ukeyResponse,
				success: true,
				data: digest,
			};
			return successResponse;
		} else {
			error.message = 'Digest error. ';
		}
		return faultResponse;
	}
	/**
	 * 摘要计算完成 要配合digestUpdate使用
	 * @param hashHandle 摘要句柄
	 * @param hexData 待摘要数据的十六进制字符串
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async digestUpdate(hashHandle: number, hexData: string): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.digestUpdate(hashHandle, hexData);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			if (UKeyUtils.checkCode(response.toString())) {
				const successResponse: UKeySuccessResponse<boolean> = {
					...ukeyResponse,
					success: true,
					data: true,
				};
				return successResponse;
			} else {
				//response 是一个10进制数。
				//167772165 ->0x0a000005
				const errorCode = getErrorCodeByCode(Number.parseInt(response));
				if (errorCode && !isSuccessCode(errorCode.code)) {
					error.code = errorCode.code;
					error.message = errorCode.description;
					error.messageId = errorCode.messageId;
					error.value = errorCode.value;
					return faultResponse;
				}
			}
		} else {
			error.message = 'DigestUpdate error. ';
		}
		return faultResponse;
	}

	/**
	 * 摘要计算完成 要配合digestUpdate使用
	 * @param hashHandle 摘要句柄
	 * @returns Promise<UKeyResponse<string>>
	 */
	async digestFinal(hashHandle: number): Promise<UKeyResponse<string>> {
		const ukeyResponse = await this.ukeyWebSocketClient.digestFinal(hashHandle);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const digestLen = UKeyUtils.hexToInt(response.substring(8, 16));
			const digest = response.substring(16, 16 + digestLen * 2);
			const successResponse: UKeySuccessResponse<string> = {
				...ukeyResponse,
				success: true,
				data: digest,
			};
			return successResponse;
		} else {
			error.message = 'DigestFinal error. ';
		}
		return faultResponse;
	}

	// 通用方法
	/**
	 * 关闭句柄
	 * @param handle 句柄
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async closeHandle(handle: number): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.closeHandle(handle);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			if (UKeyUtils.checkCode(response.toString())) {
				const successResponse: UKeySuccessResponse<boolean> = {
					...ukeyResponse,
					success: true,
					data: true,
				};
				return successResponse;
			} else {
				//response 是一个10进制数。
				//167772165 ->0x0a000005
				const errorCode = getErrorCodeByCode(Number.parseInt(response));
				if (errorCode && !isSuccessCode(errorCode.code)) {
					error.code = errorCode.code;
					error.message = errorCode.description;
					error.messageId = errorCode.messageId;
					error.value = errorCode.value;
					return faultResponse;
				}
			}
		} else {
			error.message = 'CloseHandle error. ';
		}
		return faultResponse;
	}

	// 文件管理相关方法
	/**
	 * 枚举SK文件
	 * @param appHandle 应用句柄
	 * @returns Promise<UKeyResponse<string[]>>
	 */
	async enumSKFile(appHandle: number): Promise<UKeyResponse<string[]>> {
		const ukeyResponse = await this.ukeyWebSocketClient.enumSKFile(appHandle);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const size = UKeyUtils.hexToInt(response.substring(8, 16));
			if (size < 1) {
				error.message = 'EnumSKFile error. size < 1';
				return faultResponse;
			}

			const resultStr = UKeyUtils.hexToAscii(response.substring(16, 16 + size * 2 - 2 * 2));
			if (resultStr == null) {
				error.message = 'EnumSKFile error. hexToAscii error';
			} else {
				const fileNameList = resultStr.split('\0');
				const successResponse: UKeySuccessResponse<string[]> = {
					...ukeyResponse,
					success: true,
					data: fileNameList,
				};
				return successResponse;
			}
		} else {
			error.message = 'EnumSKFile error. ';
		}
		return faultResponse;
	}

	/**
	 * 删除SK文件
	 * @param appHandle 应用句柄
	 * @param fileName 文件名
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async deleteSKFile(appHandle: number, fileName: string): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.deleteSKFile(appHandle, fileName);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			if (UKeyUtils.checkCode(response.toString())) {
				const successResponse: UKeySuccessResponse<boolean> = {
					...ukeyResponse,
					success: true,
					data: true,
				};
				return successResponse;
			} else {
				//response 是一个10进制数。
				//167772165 ->0x0a000005
				const errorCode = getErrorCodeByCode(Number.parseInt(response));
				if (errorCode && !isSuccessCode(errorCode.code)) {
					error.code = errorCode.code;
					error.message = errorCode.description;
					error.messageId = errorCode.messageId;
					error.value = errorCode.value;
					return faultResponse;
				}
			}
		} else {
			error.message = 'DeleteSKFile error. ';
		}
		return faultResponse;
	}

	/**
	 * 获取SK文件信息
	 * @param appHandle 应用句柄
	 * @param fileName 文件名
	 * @returns Promise<UKeyResponse<FileAttribute>>
	 */
	async getSKFileInfo(appHandle: number, fileName: string): Promise<UKeyResponse<FileAttribute>> {
		const ukeyResponse = await this.ukeyWebSocketClient.getSKFileInfo(appHandle, fileName);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
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
				const readRights = UKeyUtils.hexToInt(response.substring(indexStart, indexEnd));
				indexStart = indexEnd;
				indexEnd = indexStart + 4 * 2;
				const writeRights = UKeyUtils.hexToInt(response.substring(indexStart, indexEnd));

				const successResponse: UKeySuccessResponse<FileAttribute> = {
					...ukeyResponse,
					success: true,
					data: {
						fileName,
						fileSize,
						readRights,
						writeRights,
					},
				};
				return successResponse;
			} else {
				error.message = 'GetSKFileInfo error. checkCode failed';
			}
		} else {
			error.message = 'GetSKFileInfo error. ';
		}
		return faultResponse;
	}

	/**
	 * 创建SK文件
	 * @param appHandle 应用句柄
	 * @param fileName 文件名
	 * @param fileSize 文件大小
	 * @param read 读权限
	 * @param ulFIleWRight 写权限
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async createSKFile(
		appHandle: number,
		fileName: string,
		fileSize: number,
		read: number,
		ulFIleWRight: number
	): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.createSKFile(
			appHandle,
			fileName,
			fileSize,
			read,
			ulFIleWRight
		);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			if (UKeyUtils.checkCode(response.toString())) {
				const successResponse: UKeySuccessResponse<boolean> = {
					...ukeyResponse,
					success: true,
					data: true,
				};
				return successResponse;
			} else {
				//response 是一个10进制数。
				//167772165 ->0x0a000005
				const errorCode = getErrorCodeByCode(Number.parseInt(response));
				if (errorCode && !isSuccessCode(errorCode.code)) {
					error.code = errorCode.code;
					error.message = errorCode.description;
					error.messageId = errorCode.messageId;
					error.value = errorCode.value;
					return faultResponse;
				}
			}
		} else {
			error.message = 'CreateSKFile error. ';
		}
		return faultResponse;
	}

	/**
	 * 读取SK文件
	 * @param appHandle 应用句柄
	 * @param fileName 文件名
	 * @param offset 偏移
	 * @param length 长度
	 * @returns Promise<UKeyResponse<string>>
	 */
	async readSKFile(
		appHandle: number,
		fileName: string,
		offset: number,
		length: number
	): Promise<UKeyResponse<string>> {
		const ukeyResponse = await this.ukeyWebSocketClient.readSKFile(appHandle, fileName, offset, length);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const ret = UKeyUtils.hexToInt(response.substring(0, 8));
			if (UKeyUtils.checkCode(ret)) {
				const realReadSize = UKeyUtils.hexToInt(response.substring(8, 16));
				const realReadData = response.substring(16, 16 + realReadSize * 2);
				error.message = realReadData;
				const successResponse: UKeySuccessResponse<string> = {
					...ukeyResponse,
					success: true,
					data: realReadData,
				};
				return successResponse;
			} else {
				error.message = 'ReadSKFile error. checkCode failed';
			}
		} else {
			error.message = 'ReadSKFile error. ';
		}
		return faultResponse;
	}

	/**
	 * 写SK文件
	 * @param appHandle 应用句柄
	 * @param fileName 文件名
	 * @param offset 偏移
	 * @param data 数据
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async writeSKFile(
		appHandle: number,
		fileName: string,
		offset: number,
		data: string
	): Promise<UKeyResponse<boolean>> {
		const ukeyResponse = await this.ukeyWebSocketClient.writeSKFile(appHandle, fileName, offset, data);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			if (UKeyUtils.checkCode(response.toString())) {
				const successResponse: UKeySuccessResponse<boolean> = {
					...ukeyResponse,
					success: true,
					data: true,
				};
				return successResponse;
			} else {
				//response 是一个10进制数。
				//167772165 ->0x0a000005
				const errorCode = getErrorCodeByCode(Number.parseInt(response));
				if (errorCode && !isSuccessCode(errorCode.code)) {
					error.code = errorCode.code;
					error.message = errorCode.description;
					error.messageId = errorCode.messageId;
					error.value = errorCode.value;
					return faultResponse;
				}
			}
		} else {
			error.message = 'WriteSKFile error. ';
		}
		return faultResponse;
	}

	/**
	 * 生成随机数
	 * @param devHandle 设备句柄
	 * @param length 长度
	 * @returns Promise<UKeyResponse<string>>
	 */
	async genRandomData(devHandle: number, length: number): Promise<UKeyResponse<string>> {
		const ukeyResponse = await this.ukeyWebSocketClient.genRandomData(devHandle, length);
		const { result, response } = ukeyResponse;
		const error = getDefaultErrorCode();

		const faultResponse: UKeyErrorResponse = { ...ukeyResponse, success: false, error };
		if (result) {
			const responseCode = UKeyUtils.getResponseCode(response);
			const errorCode = getErrorCodeByHexString(responseCode);
			if (errorCode && !isSuccessCode(errorCode.code)) {
				error.code = errorCode.code;
				error.message = errorCode.description;
				error.messageId = errorCode.messageId;
				error.value = errorCode.value;
				return faultResponse;
			}
			const ret = UKeyUtils.hexToInt(response.substring(0, 8));
			if (UKeyUtils.checkCode(ret)) {
				const genSize = UKeyUtils.hexToInt(response.substring(8, 16));
				const genData = response.substring(16, 16 + genSize * 2);
				error.message = genData;
				const successResponse: UKeySuccessResponse<string> = {
					...ukeyResponse,
					success: true,
					data: genData,
				};
				return successResponse;
			} else {
				error.message = 'GenRandomData error. checkCode failed';
			}
		} else {
			error.message = 'GenRandomData error. ';
		}
		return faultResponse;
	}
	/**
	 * 释放资源
	 * @returns Promise<UKeyResponse<boolean>>
	 */
	async close(): Promise<UKeyResponse<boolean>> {
		let response: UKeyResponse<boolean> = {
			result: true,
			response: '',
			success: true,
			data: true,
		};
		if (this.ukeyWebSocketClient) {
			const result = await this.ukeyWebSocketClient.close();
			response = { ...response, ...result };
		}
		return response;
	}
}

export { UKeyClient };
