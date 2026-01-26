import { AlgorithmId, HashAlgId } from './constants';
import { RSAKeyLength, UKeyWebSocketResponse } from './types';

/**
 * UKey WebSocket客户端接口定义
 */
interface IUKeyWebSocketClient {
	enumDev(bPresent: boolean): Promise<UKeyWebSocketResponse>;
	connectDev(devName: string): Promise<UKeyWebSocketResponse>;
	disConnectDev(devHandle: number): Promise<UKeyWebSocketResponse>;
	setLabel(devHandle: number, label: string): Promise<UKeyWebSocketResponse>;
	getDevInfo(devHandle: number): Promise<UKeyWebSocketResponse>;
	enumApplication(devHandle: number): Promise<UKeyWebSocketResponse>;
	openApplication(devHandle: number, appName: string): Promise<UKeyWebSocketResponse>;
	verifyPIN(appHandle: number, pinType: number, pinValue: string): Promise<UKeyWebSocketResponse>;
	changePIN(
		appHandle: number,
		pinType: number,
		oldPinValue: string,
		newPinValue: string
	): Promise<UKeyWebSocketResponse>;
	closeApplication(appHandle: number): Promise<UKeyWebSocketResponse>;
	createContainer(appHandle: number, conName: string): Promise<UKeyWebSocketResponse>;
	deleteContainer(appHandle: number, conName: string): Promise<UKeyWebSocketResponse>;
	enumContainer(appHandle: number): Promise<UKeyWebSocketResponse>;
	openContainer(appHandle: number, conName: string): Promise<UKeyWebSocketResponse>;
	closeContainer(conHandle: number): Promise<UKeyWebSocketResponse>;
	getContainerType(conHandle: number): Promise<UKeyWebSocketResponse>;
	importCertificate(conHandle: number, keyType: boolean, hexCert: string): Promise<UKeyWebSocketResponse>;
	exportCertificate(conHandle: number, keyType: boolean): Promise<UKeyWebSocketResponse>;
	exportPublicKey(conHandle: number, keyType: boolean): Promise<UKeyWebSocketResponse>;
	genRSAKeyPair(conHandle: number, bitLength: RSAKeyLength): Promise<UKeyWebSocketResponse>;
	importRSAKeyPair(
		conHandle: number,
		algId: AlgorithmId,
		hexSessionKeyEncryptedData: string,
		hexRsaPriKeyEncryptedData: string
	): Promise<UKeyWebSocketResponse>;
	rsaSignData(conHandle: number, hexData: string): Promise<UKeyWebSocketResponse>;
	rsaExportSessionKey(conHandle: number, algId: AlgorithmId, hexPubKey: string): Promise<UKeyWebSocketResponse>;
	genECCKeyPair(conHandle: number): Promise<UKeyWebSocketResponse>;
	importECCKeyPair(conHandle: number, hexData: string): Promise<UKeyWebSocketResponse>;
	eccSignData(conHandle: number, hexData: string): Promise<UKeyWebSocketResponse>;
	eccExportSessionKey(conHandle: number, algId: AlgorithmId, hexPubKey: string): Promise<UKeyWebSocketResponse>;
	encryptInit(sessionKey: number, hexEncParam: string): Promise<UKeyWebSocketResponse>;
	encrypt(sessionKey: number, hexData: string): Promise<UKeyWebSocketResponse>;
	encryptUpdate(sessionKey: number, hexData: string): Promise<UKeyWebSocketResponse>;
	encryptFinal(sessionKey: number): Promise<UKeyWebSocketResponse>;
	digestInit(
		devHandle: number,
		algId: HashAlgId,
		hexPubKey: string,
		signerId: string
	): Promise<UKeyWebSocketResponse>;
	digest(hashHandle: number, hexData: string): Promise<UKeyWebSocketResponse>;
	digestUpdate(hashHandle: number, hexData: string): Promise<UKeyWebSocketResponse>;
	digestFinal(hashHandle: number): Promise<UKeyWebSocketResponse>;
	closeHandle(handle: number): Promise<UKeyWebSocketResponse>;
	enumSKFile(appHandle: number): Promise<UKeyWebSocketResponse>;
	deleteSKFile(appHandle: number, fileName: string): Promise<UKeyWebSocketResponse>;
	getSKFileInfo(appHandle: number, fileName: string): Promise<UKeyWebSocketResponse>;
	createSKFile(
		appHandle: number,
		fileName: string,
		fileSize: number,
		read: number,
		write: number
	): Promise<UKeyWebSocketResponse>;
	readSKFile(appHandle: number, fileName: string, offset: number, length: number): Promise<UKeyWebSocketResponse>;
	writeSKFile(appHandle: number, fileName: string, offset: number, data: string): Promise<UKeyWebSocketResponse>;
	genRandomData(devHandle: number, length: number): Promise<UKeyWebSocketResponse>;
	loadModule(): Promise<UKeyWebSocketResponse>;
	close(): Promise<UKeyWebSocketResponse>;
}

export { IUKeyWebSocketClient };
