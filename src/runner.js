import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { createProvider } from './services/providers/index.js';
import { scoreItem } from './services/scoring/index.js';
import { deterministicShuffleSlice } from './utils/random.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readJsonl(filePath) {
	const raw = fs.readFileSync(filePath, 'utf8');
	return raw
		.split(/\n+/)
		.filter(Boolean)
		.map((line) => JSON.parse(line));
}

function getSuiteFiles(suite) {
	const base = path.resolve(__dirname, './data');
	if (suite === 'global') return [path.join(base, 'global.jsonl')];
	if (suite === 'local:japanese') return [path.join(base, 'local_japanese.jsonl')];
	if (suite === 'local:west_african') return [path.join(base, 'local_west_african.jsonl')];
	if (suite === 'all') return [
		path.join(base, 'global.jsonl'),
		path.join(base, 'local_japanese.jsonl'),
		path.join(base, 'local_west_african.jsonl'),
	];
	throw new Error(`Unknown suite: ${suite}`);
}

export async function runEvaluation({ providerName, suite, limit, useJudge, seed }) {
	const files = getSuiteFiles(suite);
	const dataset = files.flatMap((f) => readJsonl(f));
	const sampled = deterministicShuffleSlice(dataset, seed, limit);

	const provider = createProvider(providerName);
	const results = [];
	let correct = 0;

	for (const item of sampled) {
		const answer = await provider.answer(item);
		const scored = await scoreItem(item, answer, { useJudge });
		if (scored.correct) correct += 1;
		results.push({ id: item.id, type: item.type, correct: scored.correct, details: scored });
	}

	const summary = {
		total: sampled.length,
		correct,
		accuracy: sampled.length ? +(correct / sampled.length).toFixed(3) : 0,
		byType: {
			mcq: results.filter((r) => r.type === 'mcq').reduce((acc, r) => acc + (r.correct ? 1 : 0), 0),
			open: results.filter((r) => r.type === 'open').reduce((acc, r) => acc + (r.correct ? 1 : 0), 0),
		},
	};

	console.log(chalk.gray(`\nEvaluated ${summary.total} items with provider="${providerName}" judge=${useJudge}`));
	return { results, summary };
}
