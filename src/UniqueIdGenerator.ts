/**
 * 唯一ID生成器
 */
class UniqueIdGenerator {
    private static id = 0;
    private static idMap = new WeakMap<any, number>();

    static getId(obj: any): number {
        if (!this.idMap.has(obj)) {
            this.idMap.set(obj, ++this.id);
        }
        return this.idMap.get(obj)!;
    }
    
    // 生成一个唯一的数字ID
    static generateId(): string {
        return (++this.id).toString();
    }
}

export { UniqueIdGenerator };