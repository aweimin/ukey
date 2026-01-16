import { IUKeyWebSocketClient } from './IUKeyWebSocketClient';
import { UKeyUtils } from './UKeyUtils';
import { RSAKeyResult, ECCPublicKeyBlob, ECCCipherBlobEx, RSAKeyPair, RSAKeyLength } from './types';
import { getAlgorithmId, ALGORITHM_IDS, HashAlgoId } from './constants';

/**
 * UKey 操作类，封装了与UKey控件通信的所有功能
 */
class UKeyOperations {
	private ctrl: IUKeyWebSocketClient;
	private websock: boolean;

	// 全局变量用于保存状态
	private m_DevName: string = '';
	private m_AppName: string = '';
	private m_DevHandle: number = 0;
	private m_AppHandle: number = 0;
	private m_ConHandle: number = 0;
	private m_ConName: string = '';
	private m_sessionKey: number = 0;
	private m_hHash: number = 0;

	constructor(ctrl: IUKeyWebSocketClient) {
		this.ctrl = ctrl;
		this.websock = true;
	}

	/**
	 * 枚举设备
	 */
	enumDev(): void {
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.enumDev(true).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert(response);
				} else {
					const devNameList = JSON.parse(response);
					const tipmsg = '设备列表:\n' + devNameList;
					this.m_DevName = devNameList[0];
					// document.getElementById('devnamelist').value = tipmsg;
					// document.getElementById('skfreturn').value = tipmsg;
					// document.getElementById('devname').value = l_DevNameList[0];

					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 连接设备
	 */
	connectDev(): void {
		// this.m_DevName = (document.getElementById('devname') as HTMLInputElement).value;
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.connectDev(this.m_DevName).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert(response);
				} else {
					this.m_DevHandle = JSON.parse(response);
					const tipmsg = this.m_DevName + ' 连接成功，返回句柄值 ' + this.m_DevHandle;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 断开设备连接
	 */
	disConnectDev(): void {
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.disConnectDev(this.m_DevHandle).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert(response);
				} else {
					const tipmsg = this.m_DevName + ' 断开，返回 ' + response;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 设置设备标签
	 */
	setLabel(): void {
		const label = (document.getElementById('devlabel') as HTMLInputElement).value;
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.setLabel(this.m_DevHandle, label).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert(response);
				} else {
					const tipmsg = this.m_DevName + ' 设置标签 ' + label + ' ，返回 ' + response;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 获取设备信息
	 */
	getDevInfo(): void {
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.getDevInfo(this.m_DevHandle).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert(response);
				} else {
					const devInfo = JSON.parse(response);
					const { label, SerialNumber } = devInfo;

					const tipmsg = '返回\n标签:' + label + '\n序列号:' + SerialNumber;

					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 枚举应用
	 */
	enumApplication(): void {
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.enumApplication(this.m_DevHandle).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert(response);
				} else {
					const appnamelist = JSON.parse(response);
					this.m_AppName = appnamelist[0];
					const tipmsg = '枚举应用列表:\n' + appnamelist;
					// document.getElementById('appnamelist').value = tipmsg;
					// document.getElementById('skfreturn').value = tipmsg;
					// (document.getElementById('appname') as HTMLInputElement).value = appnamelist[0];

					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 打开应用
	 */
	openApplication(): void {
		// this.m_AppName = (document.getElementById('appname') as HTMLInputElement).value;
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.openApplication(this.m_DevHandle, this.m_AppName).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert(response);
				} else {
					this.m_AppHandle = JSON.parse(response);

					const tipmsg = '打开应用 ' + this.m_AppName + ' ,返回' + true + '，句柄 ' + this.m_AppHandle;
					// document.getElementById('skfreturn').value = tipmsg;

					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 校验PIN
	 */
	verifyPIN(): void {
		const szPin = (document.getElementById('pinvalue') as HTMLInputElement).value;
		const selectType = document.getElementById('pintype') as HTMLSelectElement;
		const pinType = selectType.options[selectType.selectedIndex].value;
		let iType = 1;
		if (pinType == '0') {
			iType = 0;
		}

		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.verifyPIN(this.m_AppHandle, iType, szPin).then((json: any) => {
				const { result, response } = json;
				let tipmsg = '';
				if (!result) {
					alert(response);
					tipmsg = '校验pin失败' + response;
				} else {
					tipmsg = '校验pin成功';
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 修改PIN
	 */
	changePIN(): void {
		const szOldin = (document.getElementById('pinvalue') as HTMLInputElement).value;
		const szNewPin = (document.getElementById('newpinvalue') as HTMLInputElement).value;
		const selectType = document.getElementById('pintype') as HTMLSelectElement;
		const pinType = selectType.options[selectType.selectedIndex].value;
		let iType = 1;
		if (pinType == '0') {
			iType = 0;
		}

		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.changePIN(this.m_AppHandle, iType, szOldin, szNewPin).then((json: any) => {
				const { result, response } = json;
				let tipmsg = '';
				if (!result) {
					alert(response);
					tipmsg = '修改pin失败' + response;
				} else {
					tipmsg = '修改pin成功';

					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 关闭应用
	 */
	closeApplication(): void {
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.closeApplication(this.m_AppHandle).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert(+response);
				} else {
					const tipmsg = '应用 ' + this.m_AppName + ' 关闭返回 ' + result;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 枚举容器
	 */
	enumContainer(): void {
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.enumContainer(this.m_AppHandle).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert(response);
				} else {
					const ctnnamelist = JSON.parse(response);
					const tipmsg = '枚举容器\n' + ctnnamelist;
					// document.getElementById('ctnnamelist').value = tipmsg;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
					// (document.getElementById('ctnname') as HTMLInputElement).value = ctnnamelist[0];
					this.m_ConName = ctnnamelist[0];
				}
			});
		}
	}

	/**
	 * 创建容器
	 */
	createContainer(): void {
		const szConName = (document.getElementById('ctnname') as HTMLInputElement).value;
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.createContainer(this.m_AppHandle, szConName).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert(response);
				} else {
					this.m_ConHandle = JSON.parse(response);

					const tipmsg = '创建容器返回 ' + true + ', 句柄 ' + this.m_ConHandle;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 删除容器
	 */
	deleteContainer(): void {
		const szContainerName = (document.getElementById('ctnname') as HTMLInputElement).value;
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.deleteContainer(this.m_AppHandle, szContainerName).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert(response);
					return;
				} else {
					const tipmsg = '删除容器' + szContainerName + '返回' + result;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 打开容器
	 */
	openContainer(): void {
		const szContainerName = (document.getElementById('ctnname') as HTMLInputElement).value;
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.openContainer(this.m_AppHandle, szContainerName).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert(response);
				} else {
					this.m_ConHandle = JSON.parse(response);
					const tipmsg = '打开容器，返回句柄 ' + this.m_ConHandle;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 关闭容器
	 */
	closeContainer(): void {
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.closeContainer(this.m_ConHandle).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('CloseContainer error. ' + response);
				} else {
					const tipmsg = '关闭容器返回' + result;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 获取容器类型
	 */
	getContainerType(): void {
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.getContainerType(this.m_ConHandle).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('GetContainerType error. ' + response);
				} else {
					let typedesc = response;

					const tipmsg = '获取容器类型返回' + result + ',类型：' + typedesc;
					(document.getElementById('ctntype') as HTMLInputElement).value = typedesc;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 导入证书
	 */
	importCertificate(): void {
		const hexCert = (document.getElementById('ctncertobj') as HTMLTextAreaElement).value;
		const selectType = document.getElementById('keytype') as HTMLSelectElement;
		const certType = selectType.options[selectType.selectedIndex].value;
		const bSignFlag = certType != '0';

		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.importCertificate(this.m_ConHandle, bSignFlag, hexCert).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('ImportCertificate error. ' + response);
				} else {
					const tipmsg = '导入证书返回' + result;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 导出证书
	 */
	exportCertificate(): void {
		const selectType = document.getElementById('keytype') as HTMLSelectElement;
		const certType = selectType.options[selectType.selectedIndex].value;
		const bSignFlag = certType != '0';

		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.exportCertificate(this.m_ConHandle, bSignFlag).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('ExportCertificate error. ' + response);
				} else {
					const hexCert = response;
					const tipmsg = '导出证书返回:\n' + hexCert;
					(document.getElementById('ctnobj') as HTMLTextAreaElement).value = hexCert;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 导出公钥
	 */
	exportPublicKey(): void {
		const selectType = document.getElementById('keytype') as HTMLSelectElement;
		const certType = selectType.options[selectType.selectedIndex].value;
		const bSignFlag = certType != '0';

		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.exportPublicKey(this.m_ConHandle, bSignFlag).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('ExportPublicKey error. ' + response);
				} else {
					const pubKey = response;
					const tipmsg = 'ExportPublicKey success.public key:\n' + pubKey;
					// document.getElementById('skfreturn').value = tipmsg;
					(document.getElementById('ctnobj') as HTMLTextAreaElement).value = pubKey;
					if (!bSignFlag) {
						(document.getElementById('sespubkey') as HTMLTextAreaElement).value = pubKey;
					}
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 生成RSA密钥对
	 */
	genRSAKeyPair(): void {
		const selectType = document.getElementById('rsatype') as HTMLSelectElement;
		const certType = selectType.options[selectType.selectedIndex].value;
		let ulBitsLen: RSAKeyLength = 2048;
		if (certType == '1') {
			ulBitsLen = 1024;
		}

		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.genRSAKeyPair(this.m_ConHandle, ulBitsLen).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('GenRSAKeyPair error. ' + response);
				} else {
					const genRSAResult: RSAKeyResult = JSON.parse(response);

					let tipmsg = '成功，modulus：';
					tipmsg += genRSAResult.publicKey?.modulus;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
					return genRSAResult;
				}
			});
		}
	}

	/**
	 * 导入RSA密钥对
	 */
	importRSAKeyPair(): void {
		const selectType = document.getElementById('symencrymech2') as HTMLSelectElement;
		const algType = selectType.options[selectType.selectedIndex].value;
		let ulAlgId = getAlgorithmId(algType);

		const hexSessionKeyEncData = (document.getElementById('rsasessiondata_enc') as HTMLTextAreaElement).value;
		const hexRsaPriKeyEncData = (document.getElementById('rsaprikeydata_enc') as HTMLTextAreaElement).value;
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl
				.importRSAKeyPair(this.m_ConHandle, ulAlgId, hexSessionKeyEncData, hexRsaPriKeyEncData)
				.then((json: any) => {
					const { result, response } = json;
					if (!result) {
						alert('ImportRSAKeyPair error. ' + response);
					} else {
						const tipmsg = 'ImportRSAKeyPair success, return ' + result;
						// document.getElementById('skfreturn').value = tipmsg;
						// this.fillFloatWindow(tipmsg);
					}
				});
		}
	}

	/**
	 * 生成SM2密钥对
	 */
	genECCKeyPair(): void {
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.genECCKeyPair(this.m_ConHandle).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('GenECCKeyPair error. ' + response);
				} else {
					const ECCPUBLICKEYBLOB: ECCPublicKeyBlob = JSON.parse(response);
					const tipmsg =
						'GenECCKeyPair success, Public Key\nbits:' +
						ECCPUBLICKEYBLOB.bits +
						'\nx:' +
						ECCPUBLICKEYBLOB.x +
						'\ny:' +
						ECCPUBLICKEYBLOB.y;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 导入ECC密钥对
	 */
	importECCKeyPair(): void {
		const envelopedKeyBlob = (document.getElementById('sm2keydata_enc') as HTMLTextAreaElement).value;
		console.log(envelopedKeyBlob);
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.importECCKeyPair(this.m_ConHandle, envelopedKeyBlob).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('ImportECCKeyPair error. ' + response);
				} else {
					let tipmsg = 'ImportECCKeyPair success, return ' + result;

					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * RSA签名数据
	 */
	rsaSignData(): string | null {
		const hexData = (document.getElementById('signtestdata') as HTMLTextAreaElement).value;

		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.rsaSignData(this.m_ConHandle, hexData).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('RSASignData error. ' + response);
				} else {
					const signData = response;
					const tipmsg = 'RSA签名结果\n' + signData;
					(document.getElementById('signresultdata') as HTMLTextAreaElement).value = signData;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
					return signData;
				}
			});
		}
		return null;
	}

	/**
	 * SM2签名数据
	 */
	sm2SignData(): void {
		const hexData = (document.getElementById('signtestdata') as HTMLTextAreaElement).value;

		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.eccSignData(this.m_ConHandle, hexData).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('SM2SignData error. ' + response);
				} else {
					const responseData = JSON.parse(response);
					const signData = responseData.signData;
					const tipmsg = 'SM2SignData success\n' + signData;
					(document.getElementById('signresultdata') as HTMLTextAreaElement).value = signData;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * RSA导出会话密钥
	 */
	rsaExportSessionKey(): void {
		const pubKeyHex = (document.getElementById('sespubkey') as HTMLTextAreaElement).value;
		const selectType = document.getElementById('symencrymech') as HTMLSelectElement;
		const algType = selectType.options[selectType.selectedIndex].value;
		let ulAlgId = getAlgorithmId(algType);

		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.rsaExportSessionKey(this.m_ConHandle, ulAlgId, pubKeyHex).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('RSAExportSessionKey error. ' + response);
				} else {
					const responseData = JSON.parse(response);

					this.m_sessionKey = responseData.sessionKeyHandle;
					const sessiondata = responseData.sessionData;
					(document.getElementById('sessionkeyenc') as HTMLTextAreaElement).value = sessiondata;
					const tipmsg =
						'RSAExportSessionKey success!句柄:\n' + this.m_sessionKey + '\n会话密钥密文:\n' + sessiondata;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * ECC导出会话密钥
	 */
	eccExportSessionKey(): void {
		const hexPubKeyBlob = (document.getElementById('sespubkey') as HTMLTextAreaElement).value;
		const selectType = document.getElementById('symencrymech') as HTMLSelectElement;
		const algType = selectType.options[selectType.selectedIndex].value;
		let ulAlgId = getAlgorithmId(algType);

		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.eccExportSessionKey(this.m_ConHandle, ulAlgId, hexPubKeyBlob).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('ECCExportSessionKey error. ' + response);
				} else {
					const responseData = JSON.parse(response);

					this.m_sessionKey = responseData.sessionKeyHandle;
					const sessiondata = responseData.sessionData;

					(document.getElementById('sessionkeyenc') as HTMLTextAreaElement).value = sessiondata;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 加密初始化
	 */
	encryptInit(): void {
		const hexEncParam = (document.getElementById('eninitparam') as HTMLInputElement).value;
		console.log(hexEncParam);
		console.log(this.m_sessionKey);

		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.encryptInit(this.m_sessionKey, hexEncParam).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('EncryptInit error. ' + response);
				} else {
					const tipmsg = 'EncryptInit success';
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 加密数据
	 */
	encrypt(): void {
		const hexData = (document.getElementById('entestdata') as HTMLTextAreaElement).value;
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.encrypt(this.m_sessionKey, hexData).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('Encrypt error. ' + response);
				} else {
					const encData = response;
					const tipmsg = 'Encrypt success\n' + encData;
					(document.getElementById('enresultdata') as HTMLTextAreaElement).value = encData;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 加密数据更新
	 */
	encryptUpdate(): void {
		const hexData = (document.getElementById('entestdata') as HTMLTextAreaElement).value;

		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.encryptUpdate(this.m_sessionKey, hexData).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('EncryptUpdate error. ' + response);
				} else {
					const encData = response;
					const tipmsg = 'EncryptUpdate success!\n' + encData;
					// document.getElementById('skfreturn').value = tipmsg;
				}
			});
		}
	}

	/**
	 * 加密最终处理
	 */
	encryptFinal(): void {
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.encryptFinal(this.m_sessionKey).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('EncryptFinal error. ' + response);
				} else {
					const encData = response;
					const tipmsg = 'EncryptFinal success\n' + encData;
					(document.getElementById('enresultdata') as HTMLTextAreaElement).value = encData;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 摘要初始化
	 */
	digestInit(): void {
		const selectType = document.getElementById('mech') as HTMLSelectElement;
		const mechType = selectType.options[selectType.selectedIndex].value;
		let ulAlgID: HashAlgoId = 0;
		if (mechType == '1') {
			ulAlgID = 0x01;
		} else if (mechType == '2') {
			ulAlgID = 0x02;
		} else if (mechType == '4') {
			ulAlgID = 0x04;
		}
		const hexID = (document.getElementById('signerid') as HTMLInputElement).value;
		const hexPubKey = (document.getElementById('signerpubkey') as HTMLTextAreaElement).value;
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.digestInit(this.m_DevHandle, ulAlgID, hexPubKey, hexID).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('DigestInit error. ' + response);
				} else {
					this.m_hHash = JSON.parse(response);
					const tipmsg = 'DigestInit success';
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 计算摘要
	 */
	digest(): void {
		const hexData = (document.getElementById('hashtestdata') as HTMLTextAreaElement).value;
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.digest(this.m_hHash, hexData).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('Digest error. ' + response);
				} else {
					const digest = response;

					const tipmsg = 'Digest success\n结果:\n' + digest;
					(document.getElementById('hashresultdata') as HTMLTextAreaElement).value = digest;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 摘要更新
	 */
	digestUpdate(): void {
		const hexData = (document.getElementById('hashtestdata') as HTMLTextAreaElement).value;
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.digestUpdate(this.m_hHash, hexData).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('DigestUpdate error. ' + response);
				} else {
					const tipmsg = 'DigestUpdate success';
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 摘要最终处理
	 */
	digestFinal(): void {
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.digestFinal(this.m_hHash).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('DigestFinal error. ' + response);
				} else {
					const digestDATA = response;

					const tipmsg = 'DigestFinal success\n' + digestDATA;
					(document.getElementById('hashresultdata') as HTMLTextAreaElement).value = digestDATA;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 关闭句柄
	 */
	closeHandle(): void {
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.closeHandle(this.m_hHash).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('CloseHandle error. ' + response);
				} else {
					const tipmsg = '摘要句柄关闭成功CloseHandle success';
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 清空输出
	 */
	clearOutput(): void {
		// document.getElementById('skfreturn').value = '';
		return;
	}

	/**
	 * 枚举SK文件
	 */
	enumSKFiles(): void {
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.enumSKFile(this.m_AppHandle).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('EnumSKFile error. ' + response);
				} else {
					const skfilenamelist = JSON.parse(response);
					let tipmsg = '';
					if (skfilenamelist.length == 0) {
						tipmsg = '枚举文件列表为空\n';
					} else {
						tipmsg = '枚举文件列表\n' + skfilenamelist;
					}

					(document.getElementById('skfilenamelist') as HTMLTextAreaElement).value = tipmsg;
					// document.getElementById('skfreturn').value = tipmsg;
					(document.getElementById('skfilename') as HTMLInputElement).value = skfilenamelist[0];
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 创建SK文件
	 */
	createSKFile(): void {
		const szSkfileName = (document.getElementById('skfilename') as HTMLInputElement).value;
		if (szSkfileName.length == 0) {
			alert('文件名不能为空');
			return;
		}
		const ulSkfileNameSize = Number((document.getElementById('skfilesize') as HTMLInputElement).value);
		if (ulSkfileNameSize == 0) {
			alert('文件大小不能为空');
			return;
		}
		const rrightType = (document.getElementById('readrightoption') as HTMLSelectElement).options[
			(document.getElementById('readrightoption') as HTMLSelectElement).selectedIndex
		].value;
		let ulRR = 0;
		if (rrightType == '0') {
			ulRR = 0x00;
		} else if (rrightType == '1') {
			ulRR = 0x01;
		} else if (rrightType == '10') {
			ulRR = 0x10;
		} else {
			ulRR = 0xff;
		}
		const wrightType = (document.getElementById('writerightoption') as HTMLSelectElement).options[
			(document.getElementById('writerightoption') as HTMLSelectElement).selectedIndex
		].value;
		let ulWR = 0;
		if (wrightType == '0') {
			ulWR = 0x00;
		} else if (wrightType == '1') {
			ulWR = 0x01;
		} else if (wrightType == '10') {
			ulWR = 0x10;
		} else {
			ulWR = 0xff;
		}

		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.createSKFile(this.m_AppHandle, szSkfileName, ulSkfileNameSize, ulRR, ulWR).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('CreateFile error. ' + response);
				} else {
					const tipmsg = '创建文件返回 ' + result + ' ';
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 删除SK文件
	 */
	deleteSKFile(): void {
		const szSkfileName = (document.getElementById('skfilename') as HTMLInputElement).value;
		if (szSkfileName.length == 0) {
			alert('文件名不能为空');
			return;
		}
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.deleteSKFile(this.m_AppHandle, szSkfileName).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('DeleteSKFile error. ' + response);
					return;
				} else {
					const tipmsg = '删除文件' + szSkfileName + '返回' + true;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 获取SK文件信息
	 */
	getSKFileInfo(): void {
		const szSkfileName = (document.getElementById('skfilename') as HTMLInputElement).value;
		if (szSkfileName.length == 0) {
			alert('文件名不能为空');
			return;
		}
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.getSKFileInfo(this.m_AppHandle, szSkfileName).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('GetSKFileInfo error. ' + response);
				} else {
					const tipmsg = '获取文件[' + szSkfileName + ']信息返回' + true + ', \n信息如下:\n' + response;
					(document.getElementById('skfilenameinfo') as HTMLTextAreaElement).value = tipmsg;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 读取SK文件
	 */
	readSKFile(): void {
		const szSkfileName = (document.getElementById('skfilename') as HTMLInputElement).value;
		if (szSkfileName.length == 0) {
			alert('文件名不能为空');
			return;
		}
		const szSkfileOffsize = (document.getElementById('skfileoffsizer') as HTMLInputElement).value;
		if (szSkfileOffsize.length == 0) {
			alert('文件读取偏移量大小不能为空');
			return;
		}
		const ulSkfileNameOffSize = Number(szSkfileOffsize);
		const szSkfileNameReadSize = (document.getElementById('skfilereadsize') as HTMLInputElement).value;
		if (szSkfileNameReadSize.length == 0) {
			alert('文件读取大小不能为空');
			return;
		}
		const ulSkfileNameReadSize = Number(szSkfileNameReadSize);

		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl
				.readSKFile(this.m_AppHandle, szSkfileName, ulSkfileNameOffSize, ulSkfileNameReadSize)
				.then((json: any) => {
					const { result, response } = json;
					if (!result) {
						alert('ReadFile error. ' + response);
					} else {
						const realreaddata = response;
						const tipmsg = '读取文件返回 ' + true + ', 实际大小 ' + realreaddata.length + '字节';
						(document.getElementById('skfiledatabufr') as HTMLTextAreaElement).value = realreaddata;
						// document.getElementById('skfreturn').value = tipmsg;
						// this.fillFloatWindow(tipmsg);
					}
				});
		}
	}

	/**
	 * 写入SK文件
	 */
	writeSKFile(): void {
		const szSkfileName = (document.getElementById('skfilename') as HTMLInputElement).value;
		if (szSkfileName.length == 0) {
			alert('文件名不能为空');
			return;
		}
		const szSkfileOffsize = (document.getElementById('skfileoffsizew') as HTMLInputElement).value;
		if (szSkfileOffsize.length == 0) {
			alert('文件写入偏移量大小不能为空');
			return;
		}
		const ulSkfileOffsize = Number(szSkfileOffsize);

		const szSkfileData = (document.getElementById('skfiledatabufw') as HTMLTextAreaElement).value;
		if (szSkfileData.length == 0) {
			alert('文件数据不能为空');
			return;
		}
		if (szSkfileData.length % 2 != 0) {
			alert('文件数据格式有误，应为十六进制字符串');
			return;
		}
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.writeSKFile(this.m_AppHandle, szSkfileName, ulSkfileOffsize, szSkfileData).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('WriteSKFile error. ' + response);
				} else {
					const tipmsg = szSkfileName + '文件写入数据返回' + result;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}

	/**
	 * 生成随机数
	 */
	genRandom(): void {
		const szRandomSize = (document.getElementById('randomsize') as HTMLInputElement).value;
		if (szRandomSize.length == 0) {
			alert('随机数长度不能为空');
			return;
		}
		const ulRandomSize = Number(szRandomSize);
		if (ulRandomSize > 1024) {
			alert('目前随机数长度不能大于1024字节');
			return;
		}
		if (!this.websock) {
			alert('Warning: websocket failed');
		} else {
			this.ctrl.genRandomData(this.m_DevHandle, ulRandomSize).then((json: any) => {
				const { result, response } = json;
				if (!result) {
					alert('GenRandomData error. ' + response);
				} else {
					const realgendata = response;
					const tipmsg = '产生随机数 ' + true + ', 大小 ' + realgendata.length + '字节';
					(document.getElementById('randomresultdata') as HTMLTextAreaElement).value = realgendata;
					// document.getElementById('skfreturn').value = tipmsg;
					// this.fillFloatWindow(tipmsg);
				}
			});
		}
	}
}

export { UKeyOperations };

