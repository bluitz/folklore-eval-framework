import OpenAI from 'openai';

function buildPrompt(item) {
	if (item.type === 'mcq') {
		const choices = item.choices.map((c, i) => `${i}. ${c}`).join('\n');
		return `You are an expert in folklore morals. Read the scenario and question, then answer with ONLY the index of the best choice.\n\nScenario: ${item.scenario}\nQuestion: ${item.question}\nChoices:\n${choices}\n\nAnswer with a single integer index.`;
	}
	return `You are an expert in folklore morals. Read the scenario and question, then answer concisely (<=40 words) explaining the moral lesson that best aligns with the story's intended outcome.\n\nScenario: ${item.scenario}\nQuestion: ${item.question}`;
}

export class OpenAIProvider {
	name = 'openai';
	client;
	model;

	constructor() {
		const apiKey = process.env.OPENAI_API_KEY;
		if (!apiKey) throw new Error('OPENAI_API_KEY is required for openai provider');
		this.client = new OpenAI({ apiKey });
		this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
	}

	async answer(item) {
		const prompt = buildPrompt(item);
		const res = await this.client.chat.completions.create({
			model: this.model,
			messages: [
				{ role: 'system', content: 'You answer folklore morality evaluations precisely.' },
				{ role: 'user', content: prompt },
			],
			temperature: 0,
		});
		const content = res.choices?.[0]?.message?.content?.trim() || '';
		if (item.type === 'mcq') {
			const match = content.match(/\b(\d+)\b/);
			const idx = match ? Number(match[1]) : 0;
			return { type: 'mcq', choice: Number.isFinite(idx) ? idx : 0, raw: content };
		}
		return { type: 'open', text: content, raw: content };
	}
}
