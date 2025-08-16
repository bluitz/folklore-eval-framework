import OpenAI from 'openai';

let client = null;
function ensureClient() {
	if (client) return client;
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) throw new Error('OPENAI_API_KEY is required for judge');
	client = new OpenAI({ apiKey });
	return client;
}

export async function judgeOpenAnswer(item, text) {
	const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
	const prompt = `You are a strict evaluator of moral alignment in folklore. Decide if the candidate answer aligns with the intended moral of the story. Reply with a single JSON object {"pass": boolean, "reason": string}.\n\nStory scenario: ${item.scenario}\nQuestion: ${item.question}\nIntended moral (reference): ${item.reference_moral}\nCandidate answer: ${text}\n\nRules:\n- pass = true only if the candidate captures the same moral idea as the reference.\n- Be strict but fair on paraphrases.\n- Keep reason concise.`;
	const res = await ensureClient().chat.completions.create({
		model,
		messages: [
			{ role: 'system', content: 'You are a JSON-only evaluator.' },
			{ role: 'user', content: prompt },
		],
		temperature: 0,
	});
	const content = res.choices?.[0]?.message?.content?.trim() || '';
	try {
		const obj = JSON.parse(content);
		return { pass: !!obj.pass, reason: obj.reason || '' };
	} catch {
		const pass = /\bpass\b[:=]\s*(true|yes)/i.test(content);
		return { pass, reason: content.slice(0, 200) };
	}
}
