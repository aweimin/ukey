/**
 * 工具类，提供常用的十六进制转换和数据处理功能
 */
class UKeyUtils {
	/**
	 * 将字符串转换为十六进制字符串
	 * @param str - 输入字符串
	 * @returns 十六进制字符串
	 */
	static toHexString(str: string): string {
		let val = '';
		const chars = Array.from(str); // 使用Array.from处理Unicode字符

		for (const char of chars) {
			const codePoint = char.codePointAt(0);
			if (codePoint !== undefined) {
				const hex = codePoint.toString(16).padStart(4, '0'); // 使用4位十六进制表示完整Unicode
				val += hex;
			}
		}
		return val;
	}

	/**
	 * 检查响应码是否成功
	 * @param code - 响应码
	 * @returns 是否成功
	 */
	static checkResponse(code: string): boolean {
		return code === '00000000';
	}

	/**
	 * 反转十六进制字符串（用于字节序转换）
	 * @param str - 输入的十六进制字符串
	 * @returns 反转后的字符串
	 */
	static reverseHex(str: string): string {
		if (str.length <= 1) {
			return str;
		}

		const len = str.length / 2;
		const temp = str.substring(0, len);
		const temp2 = str.substring(len, len * 2);
		return temp2 + temp;
	}

	/**
	 * 截取十六进制字符串后半部分
	 * @param str - 输入的十六进制字符串
	 * @returns 截取后的字符串
	 */
	static cutHex(str: string): string {
		if (str.length <= 1) {
			return str;
		}
		const len = str.length / 2;
		const temp = str.substring(len, len * 2);
		return temp;
	}

	/**
	 * 将十六进制字符串按小端序转换为大端序
	 * @param str - 输入的十六进制字符串
	 * @returns 转换后的字符串
	 */
	static reverseStrByHex(str: string): string {
		if (str.length > 8) {
			console.log('超出int代表的8位长度，请仔细检查一下');
			return null!;
		}
		if (str.length < 8) {
			console.log('int值的byte[]小于8位16进制字符长度，请仔细检查一下');
			return null!;
		}
		let result = '';
		for (let i = 0; i < str.length / 2; i++) {
			const temp = str.substring(i * 2, i * 2 + 2);
			result = temp + result;
		}
		return result;
	}

	/**
	 * 将十六进制字符串转换为整数
	 * @param str - 输入的十六进制字符串
	 * @returns 转换后的整数
	 */
	static hexToInt(str: string): number {
		str = this.reverseStrByHex(str);
		return Number.parseInt(str, 16);
	}

	/**
	 * 将整数转换为十六进制字符串（大端字节序）
	 * @param num - 输入的整数
	 * @returns 转换后的十六进制字符串
	 */
	static intToBigHex(num: number): string {
		let str = num.toString(16);
		while (str.length < 8) {
			str = '0' + str;
		}
		return str;
	}

	/**
	 * 将整数转换为十六进制字符串（小端字节序）
	 * @param num - 输入的整数
	 * @returns 转换后的十六进制字符串
	 */
	static intToHex(num: number): string {
		let str = num.toString(16);
		while (str.length < 8) {
			str = '0' + str;
		}
		return this.reverseStrByHex(str);
	}

	/**
	 * 将十六进制字符串转换为ASCII字符串
	 * @param str - 输入的十六进制字符串
	 * @returns 转换后的ASCII字符串
	 */
	static hexToAscii(str: string): string {
		const fix = '0x';

		// 截取掉最后为00的字符
		let replace = 0;
		for (let i = str.length / 2 - 1; i > 0; i--) {
			const suffix = str.substring(i * 2, i * 2 + 2);
			if (suffix !== '00') {
				break;
			}
			replace += 2;
		}

		if (replace > 0) {
			str = str.substring(0, str.length - replace);
		}

		let result = '';
		for (let i = 0; i < str.length / 2; i++) {
			const temp = fix + str.substring(i * 2, i * 2 + 2);
			result += String.fromCodePoint(Number.parseInt(temp));
		}
		return result;
	}

	/**
	 * 从响应数据中提取响应码
	 * @param response - 响应数据
	 * @param index - 开始索引
	 * @returns 响应码
	 */
	static getResponseCode(response: string, index: number = 0): string {
		if (!response || response.length < 8) {
			console.log('response is invalid: ' + response);
			return '0a000001'; // 返回一个失败的错误码
		}
		const responseCode = this.reverseStrByHex(response.substring(index, index + 8));
		if (!responseCode || responseCode !== '00000000') {
			console.log('bad responseCode: ' + responseCode + ', response: ' + response);
		}
		return responseCode;
	}

	/**
	 * 检查响应码是否成功
	 * @param responseCode - 响应码
	 * @returns 是否成功
	 */
	static checkCode(responseCode: string | number): boolean {
		return Number(responseCode) === 0 || responseCode === '00000000';
	}
}

export { UKeyUtils };
