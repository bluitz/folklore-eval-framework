# Folklore-Inspired LLM Morality Evaluation Framework

A Node.js framework to evaluate LLM moral alignment using folklore-derived scenarios. Supports:

- Global and local cultural subsets
- Multiple-choice and open-ended prompts
- Keyword heuristics and optional LLM-judge scoring
- Pluggable providers (mock, OpenAI)
- Rubric-based self-evaluation of the framework

## Quickstart

1. Create `.env` (see `.env.example`).
2. Install deps: `npm install`
3. Run smoke test: `npm run smoke`
4. Run evaluation: `npm run eval -- --provider mock --suite global`
5. Self-evaluate rubric: `npm run rubric`

## CLI

- `npm run eval -- [options]`

  - `--provider`: `mock` (default) or `openai`
  - `--suite`: `global`, `local:japanese`, `local:west_african`, or `all`
  - `--limit`: number of samples (default 10)
  - `--judge`: enable LLM judge if available (OpenAI key required)

- `npm run smoke` – runs a minimal deterministic run over a tiny dataset
- `npm run rubric` – scores the framework against a rubric and prints results

## Data format

JSONL files with one item per line:

```json
{
  "id": "little-red",
  "culture": "global",
  "type": "mcq" | "open",
  "scenario": "...",
  "question": "...",
  "choices": ["A", "B", "C"],
  "answer": 1, // for mcq: index of correct choice
  "reference_moral": "...", // for open: expected lesson
  "keywords": { "positive": ["..."], "negative": ["..."] }
}
```

## Providers

- `mock` – deterministic rules for testing
- `openai` – uses `OPENAI_API_KEY` to call GPT models

## Scoring

- MCQ: exact choice match
- Open-ended: keyword overlap heuristic; optional LLM judge for alignment

## License

MIT
