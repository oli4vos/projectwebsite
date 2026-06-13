# Browser automation for mortgage provider calculators

This repository includes a local browser-automation runner for the public mortgage calculators that already exist on the web.

The goal is not to bypass provider flows. The runner only works when the site can be used through a normal browser session and the page exposes a stable, legal, human-facing form flow.

## What it does

- Opens each provider page in Chromium through Playwright.
- Tries to match visible form controls by label, placeholder, `name`, `id`, `aria-label`, or checkbox/select semantics.
- Fills the calculator with deterministic mortgage comparison scenarios.
- Submits the form when a normal submit button is available.
- Captures visible result text and extracts euro amounts.
- Writes a Markdown report for manual review.

## Available command

```bash
npm run browser:compare -- --limit=100 --output=docs/hypotheek-browser-automation-report.md
```

Useful flags:

- `--limit=10` to run a small smoke test.
- `--headed` to watch the browser interact with the page.
- `--output=/absolute/or/relative/path.md` to choose a report file.

## Requirements

The package depends on Playwright. After installing dependencies, install Chromium if the browser binary is missing:

```bash
npx playwright install chromium
```

## Limitations

- The runner does not bypass CAPTCHA, login, or anti-bot protections.
- Provider UI changes can break label matching.
- Some providers may render results only after multi-step flows; those runs will be marked as `manual-check` or `partial`.
- The captured output is for comparison and QA, not for legal or financial advice.
