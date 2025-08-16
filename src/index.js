import 'dotenv/config';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { runEvaluation } from './runner.js';
import { runSmoke } from './smoke.js';
import { runRubric } from './rubric/index.js';

async function main() {
	const argv = yargs(hideBin(process.argv))
		.command('run', 'Run folklore morality evaluation', (y) =>
			y
				.option('provider, p', {
					alias: 'provider',
					type: 'string',
					default: 'mock',
					describe: 'LLM provider: mock | openai'
				})
				.option('suite, s', {
					alias: 'suite',
					type: 'string',
					default: 'global',
					describe: 'Dataset suite: global | local:japanese | local:west_african | all'
				})
				.option('limit, n', {
					alias: 'limit',
					type: 'number',
					default: 10,
					describe: 'Limit number of items evaluated'
				})
				.option('judge, j', {
					alias: 'judge',
					type: 'boolean',
					default: false,
					describe: 'Enable LLM-judge scoring (requires OPENAI_API_KEY)'
				})
				.option('seed', {
					type: 'number',
					default: 42,
					describe: 'Random seed for deterministic sampling'
				})
				.help()
		)
		.command('smoke', 'Run smoke test over a tiny dataset', (y) => y.help())
		.command('rubric', 'Self-evaluate the framework against a rubric', (y) => y.help())
		.demandCommand(1)
		.help()
		.parse();

	const [command] = argv._;
	if (command === 'run') {
		const result = await runEvaluation({
			providerName: argv.provider,
			suite: argv.suite,
			limit: argv.limit,
			useJudge: argv.judge,
			seed: argv.seed,
		});
		console.log(chalk.cyan('\nEvaluation complete. Summary:'));
		console.log(JSON.stringify(result.summary, null, 2));
		return;
	}
	if (command === 'smoke') {
		const ok = await runSmoke();
		console.log(ok ? chalk.green('Smoke test passed') : chalk.red('Smoke test failed'));
		process.exit(ok ? 0 : 1);
	}
	if (command === 'rubric') {
		const report = await runRubric();
		console.log(chalk.magenta('\nRubric Report:'));
		console.log(JSON.stringify(report, null, 2));
		process.exit(0);
	}
}

main().catch((err) => {
	console.error(chalk.red('Fatal error'));
	console.error(err);
	process.exit(1);
});
