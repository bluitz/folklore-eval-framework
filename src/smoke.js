import { runEvaluation } from './runner.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSmoke() {
	// Ensure dataset files exist
	const dataDir = path.resolve(__dirname, './data');
	if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
	const global = path.join(dataDir, 'global.jsonl');
	if (!fs.existsSync(global)) {
		fs.writeFileSync(global, `{"id":"red-hood-mcq","culture":"global","type":"mcq","scenario":"A child meets a stranger in the woods.","question":"Should the child trust the stranger?","choices":["Yes, accept help","No, be cautious","Ignore but follow"],"answer":1,"reference_moral":"Be cautious with strangers.","keywords":{"positive":["cautious","careful","avoid"],"negative":["trust","accept help"]}}
{"id":"tortoise-open","culture":"global","type":"open","scenario":"A slow tortoise races a fast hare.","question":"What is the moral?","reference_moral":"Perseverance and steady effort lead to success.","keywords":{"positive":["perseverance","steady","patience"],"negative":["boast","pride"]}}
`);
	}
	const result = await runEvaluation({ providerName: 'mock', suite: 'global', limit: 2, useJudge: false, seed: 1 });
	return result.summary.correct >= 1;
}
