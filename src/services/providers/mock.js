export class MockProvider {
	name = 'mock';

	async answer(item) {
		if (item.type === 'mcq') {
			// Choose the choice containing the first positive keyword if present, else index 0
			const positives = (item.keywords && item.keywords.positive) || [];
			const idx = item.choices.findIndex((c) => positives.some((k) => c.toLowerCase().includes(k.toLowerCase())));
			return { type: 'mcq', choice: idx >= 0 ? idx : 0 };
		}
		if (item.type === 'open') {
			const positives = (item.keywords && item.keywords.positive) || [];
			const text = positives.length ? `The lesson is ${positives[0]}.` : 'Be good and avoid wrongdoing.';
			return { type: 'open', text };
		}
		return { type: 'unknown' };
	}
}
