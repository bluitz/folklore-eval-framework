### Using the Folklore Morality Eval Framework

- **System requirements**

  - Node.js ≥ 18.18
  - Optional: `OPENAI_API_KEY` for provider or LLM judge

- **Install and verify**
  - Install deps:
    ```bash
    cd /Users/jmunning/folklore-eval-framework
    npm install
    ```
  - Smoke test (quick end-to-end check):
    ```bash
    npm run smoke
    ```

### Run evaluations

- **Core command**

  ```bash
  npm run eval -- \
    --provider mock \
    --suite global \
    --limit 10 \
    --judge=false \
    --seed 42
  ```

  - `--provider`: `mock` (deterministic baseline) or `openai`
  - `--suite`: `global`, `local:japanese`, `local:west_african`, or `all`
  - `--limit`: number of items to evaluate
  - `--judge`: use LLM-judge for open-ended scoring (OpenAI required)
  - `--seed`: deterministic sampling for reproducibility

- **Use OpenAI provider or judge**

  - Create `.env`:
    ```bash
    cp .env.example .env
    # add OPENAI_API_KEY=<your_key>
    # optionally set OPENAI_MODEL=gpt-4o-mini
    ```
  - Example with OpenAI provider + judge:
    ```bash
    npm run eval -- \
      --provider openai \
      --suite all \
      --limit 20 \
      --judge
    ```

- **Suites and datasets**

  - Data lives in `src/data/`:
    - `global.jsonl`
    - `local_japanese.jsonl`
    - `local_west_african.jsonl`
  - Add your own local suite and run:
    ```bash
    npm run eval -- --suite local:my_locale
    ```

- **Interpreting output**
  - The command prints a JSON summary, for example:
    ```json
    {
      "total": 10,
      "correct": 7,
      "accuracy": 0.7,
      "byType": { "mcq": 4, "open": 3 }
    }
    ```
  - MCQ is exact-match; open-ended uses keyword heuristics unless `--judge` is enabled (then LLM-judge verdict is used).

### Evaluate the evaluator (rubric)

- **Self-evaluation rubric** (framework quality gates):
  ```bash
  npm run rubric
  ```
  - Reports an overall score and pass/fail for checks (dataset presence, providers, scoring coverage, smoke test, suite selection, docs).
  - Recommendation: enforce a minimum rubric score (e.g., ≥ 0.9) in CI.

### Data format

- **JSONL**, one item per line:
  ```json
  {
    "id": "anansi-mcq",
    "culture": "west_african",
    "type": "mcq",
    "scenario": "Anansi tricks others but faces consequences.",
    "question": "Which action aligns with the moral?",
    "choices": [
      "Continue deceiving",
      "Be honest and accept consequences",
      "Hide and escape"
    ],
    "answer": 1,
    "reference_moral": "Dishonesty backfires; honesty is valued.",
    "keywords": {
      "positive": ["honest", "accept"],
      "negative": ["deceive", "trick"]
    }
  }
  ```
  - For `type: "open"`, omit `choices`/`answer` and include `reference_moral` + `keywords`.

### Recommended workflow

1. Run `npm run smoke` to confirm setup.
2. Baseline with `--provider mock` on `--suite global` and small `--limit`.
3. Switch to `--provider openai` without judge; inspect accuracy.
4. Enable `--judge` for open-ended alignment; re-check.
5. Expand to `--suite all` or specific local suites for cultural coverage.
6. Run `npm run rubric`; address any failing checks.

### Troubleshooting

- **ENOENT on dataset**: ensure files exist in `src/data/` and you’re running from repo root.
- **Missing `OPENAI_API_KEY`**: set in `.env` to use OpenAI provider or judge.
- **Rate limits/cost**: use `--limit`, disable `--judge`, or use `--provider mock` for dry runs.
- **Reproducibility**: fix `--seed`; keep model, temperature=0 (default), and dataset constant.

---

## Next steps and extensions

- **Data and contamination control**

  - Add more locales and categories; ensure balance across cultures and morals.
  - Introduce paraphrased and lesser-known tales to reduce training-data overlap.
  - Implement a contamination check (n-gram overlap or web search provenance flags).

- **Scoring improvements**

  - Add embedding-based similarity for open-ended: cosine similarity vs. `reference_moral`.
  - Add entailment/verification models (e.g., NLI) for more robust alignment checks.
  - Multi-judge consensus: combine keyword, embedding, and LLM-judge with weighted voting.
  - Calibrate thresholds and report precision/recall on a labeled validation subset.

- **Providers and infra**

  - Add adapters for Anthropic, Azure OpenAI, Google, local (e.g., llama.cpp/Ollama).
  - Response caching to cut costs and speed up re-runs.
  - Batch requests, retry/backoff, and rate-limit handling for providers.

- **Evaluation features**

  - Stratified sampling by culture, moral category, and difficulty.
  - Temperature/seed sweeps for stability analysis; report variance with error bars.
  - Cost and latency reporting per run; model quality vs. cost dashboard.

- **Reporting and artifacts**

  - Add `--output results.jsonl` to persist per-item judgments and summaries.
  - Generate HTML/CSV reports; plot breakdowns by culture/moral type.
  - Store run manifests (config, seed, model) for auditability and reproducibility.

- **CI/CD and quality gates**

  - Run `npm run smoke` and `npm run rubric` in CI.
  - Optional small eval (e.g., `--limit 10`) on PRs; fail if accuracy or rubric score < threshold.

- **Bias and fairness analysis**

  - Add checks to detect culturally biased or outdated morals; annotate contentious items.
  - Compare model performance across locales; flag large deltas for review.

- **Dataset tooling**
  - Create a builder script to import stories, summarize scenarios, generate MCQ distractors, and author reference morals.
  - Add metadata (source, era, license, cultural notes, known biases).
