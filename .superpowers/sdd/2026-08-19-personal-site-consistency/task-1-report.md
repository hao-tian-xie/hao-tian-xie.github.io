# Task 1 Report: Lock in content and asset parity

## RED

Command:

```text
node --test tests/template-homepage.test.mjs
```

Observed failure before implementation:

```text
✖ keeps publication content and image assets in parity
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
3 !== 6
ℹ tests 12
ℹ pass 11
ℹ fail 1
```

## GREEN

Command:

```text
node --test tests/template-homepage.test.mjs
```

Observed passing output after implementation:

```text
ℹ tests 12
ℹ pass 12
ℹ fail 0
```

## Changes

- Added publication parity assertions for explicit unselected states, title casing, and seven `.jpg?v=28` image URLs.
- Synchronized title casing across `academic-profile.json`, English/Chinese full publication lists, and selected-publication cards.
- Added `data-selected="false"` to the three previously implicit full-list article states in both languages.
- Renamed all seven publication images from `.png` to `.jpg` without recompressing; byte-for-byte comparisons against the original Git blobs passed.

## Self-review

- `git diff --check` passed.
- No stale `.png` URLs or lowercase title variants remain in owned content/test files.
- Only Task 1-owned files are included in the commit; unrelated planning documents remain untouched.
