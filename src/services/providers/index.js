import { MockProvider } from './mock.js';
import { OpenAIProvider } from './openai.js';

export function createProvider(name) {
	if (name === 'mock') return new MockProvider();
	if (name === 'openai') return new OpenAIProvider();
	throw new Error(`Unknown provider: ${name}`);
}
