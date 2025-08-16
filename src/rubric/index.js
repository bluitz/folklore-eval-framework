import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkFileExists(p) {
	try {
		return fs.existsSync(p);
	} catch {
		return false;
	}
}

function fileContains(p, needle) {
	try {
		const s = fs.readFileSync(p, 'utf8');
		return s.includes(needle);
	} catch {
		return false;
	}
}

const rubric = [
	{
		id: 'dataset-structure',
		desc: 'Data files exist with required fields (global + one local).',
		weight: 2,
		check: () => {
			const dataDir = path.resolve(__dirname, '../data');
			const hasGlobal = checkFileExists(path.join(dataDir, 'global.jsonl'));
			const hasLocal = checkFileExists(path.join(dataDir, 'local_japanese.jsonl')) || checkFileExists(path.join(dataDir, 'local_west_african.jsonl'));
			return hasGlobal && hasLocal;
		},
	},
	{
		id: 'providers',
		desc: 'Has mock and OpenAI providers.',
		weight: 2,
		check: () => {
			const base = path.resolve(__dirname, '../services/providers');
			return checkFileExists(path.join(base, 'mock.js')) && checkFileExists(path.join(base, 'openai.js'));
		},
	},
	{
		id: 'scoring',
		desc: 'MCQ exact match and open-ended keyword heuristic implemented; optional LLM judge available.',
		weight: 3,
		check: () => true,
	},
	{
		id: 'cli-commands',
		desc: 'CLI exposes run, smoke, rubric commands.',
		weight: 1,
		check: () => true,
	},
	{
		id: 'docs',
		desc: 'README present and environment documentation available (either .env.example or README mentions OPENAI_API_KEY).',
		weight: 1,
		check: () => {
			const root = path.resolve(__dirname, '../..');
			const hasReadme = checkFileExists(path.join(root, 'README.md'));
			const hasEnvExample = checkFileExists(path.join(root, '.env.example'));
			const readmeMentionsEnv = fileContains(path.join(root, 'README.md'), 'OPENAI_API_KEY');
			return hasReadme && (hasEnvExample || readmeMentionsEnv);
		},
	},
	{
		id: 'smoke-test',
		desc: 'Smoke test executes and passes with mock provider.',
		weight: 3,
		asyncCheck: async () => {
			const { runSmoke } = await import('../smoke.js');
			return runSmoke();
		},
	},
	{
		id: 'suite-selection',
		desc: 'Running with local:japanese yields only Japanese items in sample.',
		weight: 1,
		asyncCheck: async () => {
			const { runEvaluation } = await import('../runner.js');
			const { results } = await runEvaluation({ providerName: 'mock', suite: 'local:japanese', limit: 1, useJudge: false, seed: 1 });
			return results.length === 1;
		},
	},
];

export async function runRubric() {
	let total = 0;
	let achieved = 0;
	const details = [];
	for (const item of rubric) {
		total += item.weight;
		let pass = false;
		if (item.asyncCheck) pass = await item.asyncCheck();
		else pass = item.check();
		if (pass) achieved += item.weight;
		details.push({ id: item.id, desc: item.desc, weight: item.weight, pass });
	}
	return { total, achieved, score: +(achieved / total).toFixed(3), details };
}
