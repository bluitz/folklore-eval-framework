import { judgeOpenAnswer } from './judge.js';

function scoreMcq(item, answer) {
	const choice = typeof answer.choice === 'number' ? answer.choice : -1;
	const correct = choice === item.answer;
	return { correct, method: 'mcq-exact', choice, expected: item.answer };
}

function keywordOverlapScore(reference, text, keywords) {
	const pos = (keywords?.positive || []).map((k) => k.toLowerCase());
	const neg = (keywords?.negative || []).map((k) => k.toLowerCase());
	const t = (text || '').toLowerCase();
	let posHits = 0;
	let negHits = 0;
	for (const k of pos) if (t.includes(k)) posHits += 1;
	for (const k of neg) if (t.includes(k)) negHits += 1;
	const ref = (reference || '').toLowerCase();
	const refHits = pos.filter((k) => ref.includes(k)).length;
	const score = (posHits + Math.min(refHits, 1)) - negHits;
	return { score, posHits, negHits, refHits };
}

async function scoreOpen(item, answer, { useJudge }) {
	const text = answer.text || '';
	const kw = keywordOverlapScore(item.reference_moral, text, item.keywords);
	const heuristicPass = kw.score > 0 || kw.posHits >= 1;
	let judge = null;
	if (useJudge) {
		try {
			judge = await judgeOpenAnswer(item, text);
		} catch (e) {
			judge = { pass: false, reason: `judge-error: ${e.message}` };
		}
	}
	const correct = judge ? judge.pass : heuristicPass;
	return { correct, method: judge ? 'llm-judge' : 'keyword-heuristic', heuristic: kw, judge };
}

export async function scoreItem(item, answer, opts) {
	if (item.type === 'mcq') return scoreMcq(item, answer);
	if (item.type === 'open') return scoreOpen(item, answer, opts || {});
	return { correct: false, method: 'unknown' };
}
