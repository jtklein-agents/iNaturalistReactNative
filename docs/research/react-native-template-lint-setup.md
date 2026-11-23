# What the React Native 0.84 template lint setup contains

Research for issue #2 (planning: replace the Airbnb ESLint base with `@react-native/eslint-config`). Researched 2026-11-23.

## Summary

1. The 0.84 template ships **ESLint 8 (`eslint: ^8.19.0`) with a legacy `.eslintrc.js`** whose only content is `root: true, extends: '@react-native'`; Prettier is pinned to `2.8.8`.
2. The template `.prettierrc.js` sets exactly three options: `arrowParens: 'avoid'`, `singleQuote: true`, `trailingComma: 'all'`.
3. `@react-native/eslint-config@0.84.1` sets **130 top-level rules** (mostly `warn`/`off`, few errors) plus four small overrides (Flow `*.js`, RN deep imports, TypeScript, Jest).
4. It bundles 12 dependencies (9 plugins/configs, 2 parsers, `@babel/core`); peers are `eslint ^8 || ^9` and `prettier >=2`.
5. It does **not** run Prettier as a lint rule: no `eslint-plugin-prettier`, no `prettier/prettier`. It only `extends: ['prettier']` (`eslint-config-prettier ^8.5.0`) to turn formatting rules off.
6. All bundled ranges are satisfiable by this repo's current versions (react-hooks 7.1.1, `@typescript-eslint` 8.60.1, react-native plugin 5.0.0, eslint 8.57.1); `eslint-plugin-jest ^29`, `eslint-plugin-ft-flow ^2`, `eslint-plugin-eslint-comments`, `@babel/eslint-parser`, `eslint-config-prettier` and `prettier` would be new installs.
7. Prettier **can** express: double quotes, `arrow-parens: as-needed` (`arrowParens: "avoid"`), `comma-dangle: always-multiline` (`trailingComma: "all"`).
8. Prettier **cannot** express: spaces inside parens (`if ( x )`) and `multiline-ternary: always`. There is no option for either, and Prettier would remove the paren spaces.
9. Partially: 100 columns (`printWidth: 100`, but it is a target, not a hard limit like `max-len`); `operator-linebreak: before` only via the *experimental* `experimentalOperatorPosition: "start"` (Prettier 3.x only, absent from the template's 2.8.8).
10. Newer RN has **not** moved the template to ESLint 9/flat: 0.88.1 (latest), 0.89.0-rc.2 and template `main` still ship `_eslintrc.js` + `eslint ^8.19.0`. The config package has offered an opt-in `./flat` export since 0.84.

## Sources and how they were checked

| Short name | Source |
| --- | --- |
| **RN tag** | `facebook/react-native` tag `v0.84.1` = commit `606493396eac0293ac18e118ddaab8168134768b`, directory [`packages/eslint-config-react-native/`](https://github.com/facebook/react-native/tree/v0.84.1/packages/eslint-config-react-native). The GitHub API now reports the repo as `react/react-native`; the old URL redirects. |
| **Config tarball** | `https://registry.npmjs.org/@react-native/eslint-config/-/eslint-config-0.84.1.tgz` (paths below are `package/...` inside it) |
| **Template branch** | `react-native-community/template` branch `0.84-stable` at commit [`c54e731`](https://github.com/react-native-community/template/tree/c54e73100a54576c025250d05dd0911a03b502aa/template) |
| **Template tarball** | `https://registry.npmjs.org/@react-native-community/template/-/template-0.84.1.tgz` |
| **Prettier docs** | [prettier.io/docs/options](https://prettier.io/docs/options), read from the pinned sources [`docs/options.md@3.6.2`](https://github.com/prettier/prettier/blob/3.6.2/docs/options.md) and [`docs/options.md@2.8.8`](https://github.com/prettier/prettier/blob/2.8.8/docs/options.md) |

Tarball and GitHub agree: the git blob hashes of `index.js`, `shared.js`, `flat.js`, `package.json` (config) and `_eslintrc.js`, `_prettierrc.js`, `package.json` (template) computed from the tarballs equal the blob SHAs the GitHub API returns for the tag/branch above. Tarballs were only read, nothing in them was executed.

## 1. The 0.84 template

ESLint major: **8**, legacy eslintrc format. Template files are stored with a `_` prefix and renamed to dotfiles on init.

`template/_eslintrc.js` ([source](https://github.com/react-native-community/template/blob/c54e73100a54576c025250d05dd0911a03b502aa/template/_eslintrc.js)), verbatim:

```js
module.exports = {
  root: true,
  extends: '@react-native',
};
```

`template/_prettierrc.js` ([source](https://github.com/react-native-community/template/blob/c54e73100a54576c025250d05dd0911a03b502aa/template/_prettierrc.js)), verbatim:

```js
module.exports = {
  arrowParens: 'avoid',
  singleQuote: true,
  trailingComma: 'all',
};
```

Lint-related entries in `template/package.json` ([source](https://github.com/react-native-community/template/blob/c54e73100a54576c025250d05dd0911a03b502aa/template/package.json); identical in the template tarball `package/template/package.json`):

```json
"scripts": { "lint": "eslint ." },
"devDependencies": {
  "@react-native/eslint-config": "0.84.1",
  "@react-native/typescript-config": "0.84.1",
  "eslint": "^8.19.0",
  "prettier": "2.8.8",
  "typescript": "^5.8.3"
}
```

There is no `eslint-plugin-prettier`, no `format` script, and no lint-staged/husky in the template. Prettier is installed and configured but nothing in the template invokes it.

## 2. `@react-native/eslint-config@0.84.1`

Files: `index.js` (legacy config, the `main`), `flat.js` (flat config, exported as `./flat`), `shared.js` (rules/globals/overrides used by both), `README.md` ([RN tag](https://github.com/facebook/react-native/tree/v0.84.1/packages/eslint-config-react-native)).

### Dependencies (`package.json`)

| Dependency | Range | Role |
| --- | --- | --- |
| `@babel/core` | `^7.25.2` | peer of the Babel parser |
| `@babel/eslint-parser` | `^7.25.1` | parser for `*.js` / `*.jsx` |
| `@react-native/eslint-plugin` | `0.84.1` | rules `no-deep-imports`, `platform-colors` (only the first is enabled) |
| `@typescript-eslint/eslint-plugin` | `^8.36.0` | TS override |
| `@typescript-eslint/parser` | `^8.36.0` | parser for `*.ts` / `*.tsx` |
| `eslint-config-prettier` | `^8.5.0` | `extends: ['prettier']` |
| `eslint-plugin-eslint-comments` | `^3.2.0` | |
| `eslint-plugin-ft-flow` | `^2.0.1` | Flow override |
| `eslint-plugin-jest` | `^29.0.1` | |
| `eslint-plugin-react` | `^7.30.1` | |
| `eslint-plugin-react-hooks` | `^7.0.1` | |
| `eslint-plugin-react-native` | `^5.0.0` | |

Peer dependencies: `eslint: "^8.0.0 || ^9.0.0"`, `prettier: ">=2"`. Dev dependencies (what the package itself is tested with): `eslint ^8.57.0`, `prettier 3.6.2`. Engines: `node >= 20.19.4`.

### Top-level structure (`index.js`)

- `env: { es6: true }`; `parserOptions: { sourceType: 'module', ecmaFeatures: { jsx: true } }`; `settings.react.version: 'detect'`.
- `extends: ['prettier']`.
- `plugins`: `eslint-comments`, `react`, `react-hooks`, `react-native`, `@react-native`, `jest`.
- It does **not** extend `eslint:recommended`, `plugin:react/recommended`, `plugin:react-hooks/recommended`, `plugin:@typescript-eslint/recommended` or `plugin:jest/recommended`. Every active rule is listed below.
- `globals` (`shared.js` lines 62–106): 43 names such as `__DEV__`, `fetch`, `requestIdleCallback`, `cancelIdleCallback`, `setImmediate`, `FormData`, `WebSocket`, `window`, `process`, `require`, `module`. (This repo's own `globals` block for `__DEV__`, `requestIdleCallback`, `cancelIdleCallback` would become redundant; `HermesInternal` is not in the list.)

### Overrides (`index.js` lines 33–65, rule bodies in `shared.js` lines 25–59)

| Files | Parser / plugins / env | Rules |
| --- | --- | --- |
| `*.js` | `@babel/eslint-parser`, plugin `ft-flow` | `ft-flow/define-flow-type: 1`, `ft-flow/use-flow-type: 1` |
| `*.jsx` | `@babel/eslint-parser` | none |
| `*.js`, `*.jsx`, `*.ts`, `*.tsx` | | `@react-native/no-deep-imports: 1` |
| `*.ts`, `*.tsx` | `@typescript-eslint/parser`, plugin `@typescript-eslint/eslint-plugin` | `@typescript-eslint/no-unused-vars: ['error', { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }]`, `no-unused-vars: 'off'`, `no-shadow: 'off'`, `@typescript-eslint/no-shadow: 1`, `no-undef: 'off'` |
| `*.{spec,test}.{js,ts,tsx}`, `**/__{mocks,tests}__/**/*.{js,ts,tsx}` | `env: { jest: true, 'jest/globals': true }` | `react-native/no-inline-styles: 0` |

### Rules (`shared.js` lines 108–280; 0 = off, 1 = warn, 2 = error)

130 rules in total, grouped as in the source.

**General (22)**
- error: `no-const-assign`, `no-dupe-class-members`, `no-dupe-keys`, `no-unreachable`
- warn: `no-cond-assign`, `no-control-regex`, `no-debugger`, `no-ex-assign`, `no-extra-boolean-cast`, `no-func-assign`, `no-invalid-regexp`, `no-negated-in-lhs`, `no-obj-calls`, `no-regex-spaces`, `no-sparse-arrays`, `use-isnan`, `valid-typeof`
- off: `no-console`, `no-constant-condition`, `no-empty`, `no-inner-declarations`, `valid-jsdoc`

**Best practices (42)**
- error: `no-eval`, `no-new-func`
- warn: `dot-notation`, `eqeqeq: [1, 'allow-null']`, `no-alert`, `no-caller`, `no-div-regex`, `no-extend-native`, `no-extra-bind`, `no-fallthrough`, `no-implied-eval`, `no-labels`, `no-iterator`, `no-lone-blocks`, `no-new`, `no-new-wrappers`, `no-octal`, `no-octal-escape`, `no-proto`, `no-return-assign`, `no-script-url`, `no-self-compare`, `no-sequences`, `no-useless-escape`, `no-void`, `no-with`, `radix`, `yoda`
- off: `block-scoped-var`, `complexity`, `consistent-return`, `default-case`, `guard-for-in`, `no-else-return`, `no-eq-null`, `no-loop-func`, `no-multi-str`, `no-native-reassign`, `no-redeclare`, `no-unused-expressions`, `no-warning-comments`, `vars-on-top`

**Variables (11)**
- error: `no-global-assign`, `no-undef`
- warn: `no-catch-shadow`, `no-delete-var`, `no-label-var`, `no-shadow`, `no-shadow-restricted-names`, `no-undef-init`, `no-unused-vars: [1, { vars: 'all', args: 'none', ignoreRestSiblings: true }]`
- off: `no-undefined`, `no-use-before-define`

**Node.js (7)**
- warn: `handle-callback-err`, `no-mixed-requires`, `no-new-require`, `no-path-concat`, `no-restricted-modules`
- off: `no-process-exit`, `no-sync`

**`eslint-comments` (4)**, all warn: `no-aggregating-enable`, `no-unlimited-disable`, `no-unused-disable`, `no-unused-enable`

**Stylistic (15)**
- warn: `consistent-this`, `no-array-constructor`, `no-empty-character-class`, `no-new-object`
- off: `camelcase`, `func-names`, `func-style`, `new-cap`, `no-nested-ternary`, `no-lonely-if`, `no-ternary`, `no-underscore-dangle`, `sort-vars`, `max-nested-callbacks`, `one-var`

**Legacy (5)**
- warn: `no-bitwise`
- off: `max-depth`, `max-params`, `max-statements`, `no-plusplus`

**`react` (17)**
- error: `react/jsx-no-comment-textnodes`, `react/jsx-no-duplicate-props`, `react/jsx-no-undef`, `react/no-string-refs`
- warn: `react/jsx-uses-react`, `react/jsx-uses-vars`, `react/no-did-mount-set-state`, `react/no-did-update-set-state`, `react/no-unstable-nested-components`, `react/self-closing-comp`
- off: `react/display-name`, `react/jsx-boolean-value`, `react/jsx-sort-props`, `react/no-multi-comp`, `react/no-unknown-property`, `react/react-in-jsx-scope`, `react/wrap-multilines`

**`react-hooks` (2)**, both error: `react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`. None of the React Compiler rules this repo enables as warnings (`static-components`, `set-state-in-effect`, `refs`, …) are set.

**`react-native` (1)**: `react-native/no-inline-styles: 1` (this repo has it as `error`; off in Jest files per the override).

**`jest` (4)**, all warn: `jest/no-disabled-tests`, `jest/no-focused-tests`, `jest/no-identical-title`, `jest/valid-expect`

The config sets **no** formatting rules of its own (no `quotes`, `indent`, `max-len`, `semi`, `comma-dangle`, …), no `import/*` rules, no `jsx-a11y`/`react-native-a11y` rules. A test in the package (`package/__tests__/prettier-config-test.js`) asserts that none of its rules collide with `eslint-config-prettier`.

Unverified: several of the listed core rules (`no-native-reassign`, `no-negated-in-lhs`, `no-catch-shadow`, `no-new-object`, `valid-jsdoc`, the Node.js group) are, from memory, deprecated in ESLint 8 and some are removed in ESLint 9. I did not check each against ESLint's rule docs.

## 3. Prettier enforcement

- **Not enforced as a lint rule.** `eslint-plugin-prettier` is not in `dependencies`, `prettier/prettier` appears nowhere in `index.js`, `flat.js` or `shared.js` (config tarball; [RN tag `package.json`](https://github.com/facebook/react-native/blob/v0.84.1/packages/eslint-config-react-native/package.json)).
- The only Prettier coupling is `extends: ['prettier']` (`index.js` line 20), i.e. `eslint-config-prettier ^8.5.0`, which only switches rules off.
- Expected Prettier version: peer `prettier: ">=2"`. The template pins `2.8.8`; the config package's own devDependency is `3.6.2`. Any Prettier 2 or 3 satisfies the peer.
- Consequence for this repo: `eslint-config-prettier@8.10.2` turns off `space-in-parens`, `operator-linebreak`, `multiline-ternary`, `arrow-parens`, `comma-dangle`, `indent` (`package/index.js` lines 28–74 of that tarball) and lists `max-len` and `quotes` as special rules set to `0` (lines 12, 17). It has no `@stylistic/*` entries (0 matches), so `@stylistic/member-delimiter-style` is untouched. Rules in this repo's own `.eslintrc.js` `rules` block are declared after `extends`, so by eslintrc precedence they would stay active. Unverified by running ESLint; I did not install the config and run `eslint --print-config`.

## 4. Coexistence with this repo's versions

Current state from `package.json`, `package-lock.json` and `.eslintrc.js` in this repo:

| Package | RN config wants | This repo | Result |
| --- | --- | --- | --- |
| `eslint` | peer `^8.0.0 \|\| ^9.0.0` | `^8.57.1` (lock 8.57.1) | OK |
| `eslint-plugin-react-hooks` | `^7.0.1` | `^7.1.1` plus an npm `overrides` entry (lock 7.1.1) | OK, dedupes to one copy |
| `@typescript-eslint/eslint-plugin` | `^8.36.0` | `^8.60.1` (lock 8.60.1) | OK |
| `@typescript-eslint/parser` | `^8.36.0` | not a direct dependency; lock 8.60.1 | OK |
| `eslint-plugin-react-native` | `^5.0.0` | `^5.0.0` (lock 5.0.0) | OK |
| `eslint-plugin-react` | `^7.30.1` | not a direct dependency; lock 7.34.1 (arrives via the Airbnb setup) | OK; after removing Airbnb it comes from the RN config |
| `eslint-plugin-jest` | `^29.0.1` | not installed | new. v29 peers: `eslint ^8.57.0 \|\| ^9 \|\| ^10`, `@typescript-eslint/eslint-plugin ^8.0.0`, `jest *`, `typescript >=4.8.4 <8` (npm registry, 29.17.1). All met (jest `^29.7.0`, typescript `^5.8.3`). |
| `eslint-plugin-ft-flow` | `^2.0.1` | not installed | new. v2.0.3 peers: `eslint ^8.1.0`, `@babel/eslint-parser ^7.12.0`. Met on ESLint 8; **the peer range excludes ESLint 9**. |
| `eslint-plugin-eslint-comments` | `^3.2.0` | not installed | new, peer `eslint >=4.19.1` |
| `eslint-config-prettier` | `^8.5.0` | not installed | new, peer `eslint >=7.0.0` |
| `@babel/eslint-parser` | `^7.25.1` | not installed | new, peers `eslint ^7.5 \|\| ^8 \|\| ^9`, `@babel/core ^7.11.0` |
| `prettier` | peer `>=2` | not installed, no `.prettierrc*` | must be added (npm 7+ installs missing peers automatically; unpinned that resolves to the current latest, 3.10.1) |

No version range conflicts. Behavioural points the planners should know (from reading the config, not from a test run):

- The RN config forces `@babel/eslint-parser` for `*.js`/`*.jsx`. This repo currently sets `@typescript-eslint/parser` for everything at the top level. `src/` has 57 `@flow` `.js` files (68 `.js`/`.jsx` vs 698 `.ts`/`.tsx`).
- The RN config's `*.ts` override turns `no-undef` off; this repo deliberately keeps `no-undef: "error"` (see the comment in `.eslintrc.js`).
- The RN config's `*.ts` override sets `@typescript-eslint/no-unused-vars` with fewer options than this repo's (`vars`, `args`, `ignoreRestSiblings`, `caughtErrors*` are missing).
- The Jest override globs match `*.test.js`/`*.test.tsx`-style basenames and `__mocks__`/`__tests__` directories. This repo's `tests/**` helpers that are not named `*.test.*` are not matched by it.
- Unverified: exact precedence between the RN config's `overrides` and this repo's top-level `rules` when both set the same rule. My reading of eslintrc semantics is that the extending config wins, but I did not run it.

## 5. House style vs. Prettier options

Option facts are from [`docs/options.md@3.6.2`](https://github.com/prettier/prettier/blob/3.6.2/docs/options.md) (live: [prettier.io/docs/options](https://prettier.io/docs/options)).

| House rule (`.eslintrc.js`) | Prettier | Notes |
| --- | --- | --- |
| `quotes: double` | **Yes.** `singleQuote: false`, the default ([Quotes](https://prettier.io/docs/options#quotes)) | The template sets `singleQuote: true`, so that line has to go. Prettier picks the quote with fewer escapes, so `'say "hi"'` stays single-quoted ([rationale, Strings](https://github.com/prettier/prettier/blob/3.6.2/docs/rationale.md#strings)); ESLint `quotes: double` without `avoidEscape` flags that. |
| `space-in-parens: always` | **No.** No such option. | The only spacing option is [Bracket Spacing](https://prettier.io/docs/options#bracket-spacing), documented as "Print spaces between brackets in object literals". Prettier's [option philosophy](https://prettier.io/docs/option-philosophy) states "we won't add more of them". Running Prettier rewrites `if ( x )` to `if (x)` everywhere. |
| `max-len: 100` | **Partly.** `printWidth: 100` ([Print Width](https://prettier.io/docs/options#print-width)) | The docs say: "It is not the hard upper allowed line length limit" and "don't try to use printWidth as if it was ESLint's max-len". Default is 80 and the docs recommend against more. Long strings and comments are not wrapped, so `max-len` (this repo has `ignoreStrings: false`, `ignoreComments: false`) can still fail after formatting. |
| `operator-linebreak: before` | **Partly, experimental only.** `experimentalOperatorPosition: "start"` ([Experimental Operator Position](https://prettier.io/docs/options#experimental-operator-position)) | Default is `"end"`: "print operators at the end of previous lines". The option covers binary expressions. It exists in the 3.6.2 docs and not in the [2.8.8 docs](https://github.com/prettier/prettier/blob/2.8.8/docs/options.md), so the template's pinned 2.8.8 cannot do it. Ternary `?`/`:` already go at line start by default (the [Experimental Ternaries](https://prettier.io/docs/options#experimental-ternaries) section describes the default as keeping "question marks on the same line as the consequent"). Unverified: the release that introduced the option (3.5 from memory) and how assignment `=` is handled. |
| `multiline-ternary: always` | **No.** No such option. | Prettier keeps a ternary on one line when it fits the print width. `experimentalTernaries` changes where `?` goes, not whether short ternaries break. |
| `arrow-parens: as-needed` | **Yes.** `arrowParens: "avoid"` ([Arrow Function Parentheses](https://prettier.io/docs/options#arrow-function-parentheses)) | Already in the template config. Prettier's default is `"always"`. |
| `comma-dangle: always-multiline` | **Yes.** `trailingComma: "all"` ([Trailing Commas](https://prettier.io/docs/options#trailing-commas)) | Already in the template config; default since Prettier 3.0 (2.x default is `es5`). `"all"` includes function parameters and calls, which matches ESLint's string option at `ecmaVersion >= 2017` ([`comma-dangle.js@v8.57.1`, `normalizeOptions`](https://github.com/eslint/eslint/blob/v8.57.1/lib/rules/comma-dangle.js#L47-L56)). |

Net: adopting the template's Prettier flow means giving up `space-in-parens` and `multiline-ternary` and accepting soft 100-column wrapping. Adopting only `@react-native/eslint-config` without running Prettier is possible (Prettier is a peer dependency but nothing invokes it), in which case the house formatting rules can stay in `.eslintrc.js`.

## 6. What newer RN versions do

As of 2026-11-23 nothing newer has moved the template to ESLint 9 or flat config. `@react-native-community/template@0.88.1` (npm `latest`) and `0.89.0-rc.2` (npm `next`) still contain `template/_eslintrc.js` with the same three lines, `eslint: ^8.19.0` and `prettier: 2.8.8` (template tarballs, `package/template/package.json`), and so does the template repo's `main` branch ([`3c1a5b2`](https://github.com/react-native-community/template/tree/3c1a5b216a2bc570ae1de4ed0aee33c85c407a9a/template)). What changed is on the config side: `@react-native/eslint-config` gained a `./flat` export in [facebook/react-native#54297](https://github.com/facebook/react-native/pull/54297) (commit `18592451de`, 2025-11-13, "Add support for Flat Config (eslint v9)"); 0.83.0 and 0.83.10 have no `exports` field and peer `eslint >=8`, while 0.84.1 has `./flat` and peer `^8.0.0 || ^9.0.0`. Its README documents both paths: `require('@react-native/eslint-config/flat')` for ESLint 9, `extends: "@react-native"` for ESLint 8. Between 0.84.1 and 0.88.1 the three config files (`index.js`, `flat.js`, `shared.js`) are byte-identical; only dependency floors moved (`@typescript-eslint ^8.59.2`, `eslint-plugin-react ^7.37.5`). On the monorepo's `main`, `eslint-plugin-ft-flow` is bumped to `^3.0.11`, whose peers are `eslint ^8.56.0 || ^9.0.0` and `hermes-eslint >=0.15.0`, which removes the ESLint-8-only peer noted in section 4. So ESLint 9 is opt-in today and the template default is still ESLint 8. Unverified: whether or when the template will switch; I found no announcement and did not search RN discussions or release notes for one.

## Unverified items (collected)

- Effective merged config for this repo (rule precedence between RN config overrides and this repo's rules): not run.
- Deprecated/removed status of individual core rules in the RN config under ESLint 8/9.
- Prettier version that introduced `experimentalOperatorPosition`; Prettier's handling of line breaks around `=`.
- Whether the flat config actually works on ESLint 9 with `eslint-plugin-ft-flow ^2` (peer says ESLint 8 only).
- Any future plan to move the template to ESLint 9.
