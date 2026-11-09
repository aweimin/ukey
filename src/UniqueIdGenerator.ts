/**
 * 唯一ID生成器
 */
class UniqueIdGenerator {
	private static id = 0;

	// 生成一个唯一的数字ID
	static generateId(): string {
		return (++this.id).toString();
	}
}

export { UniqueIdGenerator };
