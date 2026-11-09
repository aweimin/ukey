import { UniqueIdGenerator } from '../src/UniqueIdGenerator';

describe('UniqueIdGenerator', () => {
	test('连续生成递增且唯一的 ID', () => {
		const id1 = UniqueIdGenerator.generateId();
		const id2 = UniqueIdGenerator.generateId();
		const id3 = UniqueIdGenerator.generateId();
		expect(id1).not.toBe(id2);
		expect(id2).not.toBe(id3);
		expect(Number(id2)).toBe(Number(id1) + 1);
	});
});
