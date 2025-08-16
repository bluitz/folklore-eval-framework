export function deterministicShuffleSlice(items, seed, limit) {
	const arr = items.slice();
	let s = seed >>> 0;
	function rnd() {
		// xorshift32
		s ^= s << 13;
		s ^= s >>> 17;
		s ^= s << 5;
		return (s >>> 0) / 0xffffffff;
	}
	for (let i = arr.length - 1; i > 0; i -= 1) {
		const j = Math.floor(rnd() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return typeof limit === 'number' ? arr.slice(0, limit) : arr;
}
