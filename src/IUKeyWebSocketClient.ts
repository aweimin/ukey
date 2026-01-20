import { AlgorithmId, HashAlgoId } from './constants';
import { UKeyResponse, RSAKeyLength } from './types';

/**
 * UKey WebSocket客户端接口定义
 */
interface IUKeyWebSocketClient {
	enumDev(bPresent: boolean): Promise<UKeyResponse>;
	connectDev(devName: string): Promise<UKeyResponse>;
	disConnectDev(devHandle: number): Promise<UKeyResponse>;
	setLabel(devHandle: number, label: string): Promise<UKeyResponse>;
	getDevInfo(devHandle: number): Promise<UKeyResponse>;
	enumApplication(devHandle: number): Promise<UKeyResponse>;
	openApplication(devHandle: number, appName: string): Promise<UKeyResponse>;
	verifyPIN(appHandle: number, pinType: number, pinValue: string): Promise<UKeyResponse>;
	changePIN(appHandle: number, pinType: number, oldPinValue: string, newPinValue: string): Promise<UKeyResponse>;
	closeApplication(appHandle: number): Promise<UKeyResponse>;
	createContainer(appHandle: number, conName: string): Promise<UKeyResponse>;
	deleteContainer(appHandle: number, conName: string): Promise<UKeyResponse>;
	enumContainer(appHandle: number): Promise<UKeyResponse>;
	openContainer(appHandle: number, conName: string): Promise<UKeyResponse>;
	closeContainer(conHandle: number): Promise<UKeyResponse>;
	getContainerType(conHandle: number): Promise<UKeyResponse>;
	importCertificate(conHandle: number, keyType: boolean, hexCert: string): Promise<UKeyResponse>;
	exportCertificate(conHandle: number, keyType: boolean): Promise<UKeyResponse>;
	exportPublicKey(conHandle: number, keyType: boolean): Promise<UKeyResponse>;
	genRSAKeyPair(conHandle: number, bitLength: RSAKeyLength): Promise<UKeyResponse>;
	importRSAKeyPair(
		conHandle: number,
		algId: AlgorithmId,
		hexSessionKeyEncryptedData: string,
		hexRsaPriKeyEncryptedData: string
	): Promise<UKeyResponse>;
	rsaSignData(conHandle: number, hexData: string): Promise<UKeyResponse>;
	rsaExportSessionKey(conHandle: number, algId: AlgorithmId, hexPubKey: string): Promise<UKeyResponse>;
	genECCKeyPair(conHandle: number): Promise<UKeyResponse>;
	importECCKeyPair(conHandle: number, hexData: string): Promise<UKeyResponse>;
	eccSignData(conHandle: number, hexData: string): Promise<UKeyResponse>;
	eccExportSessionKey(conHandle: number, algId: AlgorithmId, hexPubKey: string): Promise<UKeyResponse>;
	encryptInit(sessionKey: number, hexEncParam: string): Promise<UKeyResponse>;
	encrypt(sessionKey: number, hexData: string): Promise<UKeyResponse>;
	encryptUpdate(sessionKey: number, hexData: string): Promise<UKeyResponse>;
	encryptFinal(sessionKey: number): Promise<UKeyResponse>;
	digestInit(devHandle: number, algId: HashAlgoId, hexPubKey: string, signerId: string): Promise<UKeyResponse>;
	digest(hashHandle: number, hexData: string): Promise<UKeyResponse>;
	digestUpdate(hashHandle: number, hexData: string): Promise<UKeyResponse>;
	digestFinal(hashHandle: number): Promise<UKeyResponse>;
	closeHandle(handle: number): Promise<UKeyResponse>;
	enumSKFile(appHandle: number): Promise<UKeyResponse>;
	deleteSKFile(appHandle: number, fileName: string): Promise<UKeyResponse>;
	getSKFileInfo(appHandle: number, fileName: string): Promise<UKeyResponse>;
	createSKFile(
		appHandle: number,
		fileName: string,
		fileSize: number,
		read: number,
		write: number
	): Promise<UKeyResponse>;
	readSKFile(appHandle: number, fileName: string, offset: number, length: number): Promise<UKeyResponse>;
	writeSKFile(appHandle: number, fileName: string, offset: number, data: string): Promise<UKeyResponse>;
	genRandomData(devHandle: number, length: number): Promise<UKeyResponse>;
	loadModule(): Promise<UKeyResponse>;
	close(): Promise<UKeyResponse>;
}

export { IUKeyWebSocketClient };
