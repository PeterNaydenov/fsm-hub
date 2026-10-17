## Release History



### 3.0.0 ( 2026-10-17)
- [x] Breaking: Dependency update. @peter.naydenov/fsm - v.6.0.0. The fsm engine moved to dt-toolbox 8, so fsm-hub gets a major version together with fsm;
- [x] Breaking: CommonJS types. `require` now resolves to `dist/types/main.d.cts` with `export =`, which matches `module.exports = FsmHub` in `dist/fsm-hub.cjs`. Named types are on the namespace: `FsmHub.HubDescription`. Before, CommonJS consumers got the ESM types, so `require(...).default` passed the type check but was `undefined` at runtime. Checked with `@arethetypeswrong/cli`: node10, node16 (CJS and ESM) and bundler pass;
- [x] Breaking: The hub ignores updates without a successful transition: unknown actions and transitions with `success: false`. Before, they triggered the reactions for the unchanged state again. A successful transition to the same state still triggers reactions. Registered FSMs must support `on('positive', fn)`;
- [x] Breaking: A thrown callback or transformer, or a rejected subscriber update, is logged with `console.error` (also without `debug`), and the hub keeps working. Before, the error was not caught and the hub stopped reacting;
- [x] Fix: The hub stopped reacting for good when an update came in during a chain reaction (for example a subscriber transition without `response`, plus any other update). The hub now runs one reaction at a time. Updates from FSMs that the current reaction updates go first, then other updates in FIFO order. `hub.haveInternalRequest` is replaced by `hub.updating`;
- [x] Fix: An update with a `response` that came during a reaction ran at once, and when it finished it released the lock of the reaction that was still running;
- [x] Fix: FSMs, callbacks and transformers can use names from `Object.prototype` like `constructor` or `toString`. Before, they were reported as already registered, or an unregistered `valueOf` callback called `Object.prototype.valueOf` and crashed;
- [x] Dependency update. @peter.naydenov/stack - v.3.0.2;
- [x] Dependency update. ask-for-promise - v.3.2.1;
- [x] Package: A `files` list in `package.json`. Tests, configs and `AGENTS.md` are no longer published (tarball 27 KB → 21 KB);
- [x] Package: `prepublishOnly` runs the tests and the type tests, then builds the bundles;
- [x] Tests: Type test for CommonJS consumers (`import FsmHub = require(...)`);
- [x] Tests: Regression tests for the scheduler, listener errors, prototype names and failed transitions. 17 → 30 tests;



### 2.2.0 ( 2026-10-09)
- [x] Dependency update. @peter.naydenov/fsm - v.5.3.0;
- [x] Rewrite of jsdoc comments;
- [x] Typescript generates d.ts files from jsdoc comments;
- [x] Skill 'fsm-hub' was created;



### 2.1.9 ( 2026-09-26)
- [x] Dependency update. @peter.naydenov/fsm - v.5.2.11;



### 2.1.8 ( 2026-09-03)
- [x] Dependency update. @peter.naydenov/fsm - v.5.2.10;



### 2.1.7 ( 2026-07-25)
- [x] Dependency update. @peter.naydenov/stack - v.3.0.1;
- [x] Migrating the testing framework from mocha to vitest;
- [x] Migrating the coverage framework from c8 to vitest/coverage-v8;



### 2.1.6 ( 2026-07-22)
- [x] Fix: `_callback.js` crashed when a callback rule fired with a `null` response (or a transformer returning `null`). Guarded the `.answer` access so the placeholder-clear no-ops and the callback still runs.
- [x] Fix: `MISSING_FSM` debugger call logged the whole subscribers array instead of the missing name. Now passes the specific missing entry.
- [x] Tests: 3 regression cases added (1 for the `MISSING_FSM` data, 2 for the null-response crashes). 14 → 17 passing;
- [x] Dev dependencies updates. @peter.naydenov/fsm - v.5.2.7;



### 2.1.5 ( 2026-07-21)
- [x] Dependency update. ask-for-promise@3.2.0;
- [x] Dev dependency update. @peter.naydenov/fsm - v.5.2.6;



### 2.1.4 ( 2026-05-11)
- [x] Dependency update. ask-for-promise@3.1.1;
- [x] Dev dependency update. @peter.naydenov/fsm - v.5.2.5;



### 2.1.2 ( 2024-11-13)
- [x] Dependency update. Ask-for-promise@3.1.0;
- [x] Dev dependency update. @peter.naydenov/fsm - v.5.2.4;



### 2.1.1 ( 2024-12-09)
- [x] Dev dependency update. @peter.naydenov/fsm - v.5.2.1;
- [x] Dev dependencies updates. Rollup@4.28.1;
- [x] Dev dependencies updates. Mocha@11.0.1;



### 2.1.0 ( 2024-02-04)
- [x] Dependency update. ask-for-promise@2.0.3;
- [x] Dependency update. @peter.naydenov/stack@3.0.0;
- [x] Dev dependency update. @peter.naydenov/fsm - v.5.2.0;
- [x] Dev dependencies updates. Chai@5.0.3;
- [x] Dev dependencies updates. C8@9.1.0;
- [x] Folder 'dist' was added to the project. Includes commonjs, umd and esm versions of the library;
- [x] Package.json: "exports" section was added. Allows you to use package as commonjs or es6 module without additional configuration;
- [x] Rollup was added to the project. Used to build the library versions;



### 2.0.5 ( 2023-10-21 )
- [x] Dependency update. @peter.naydenov/fsm - v.5.1.2;



### 2.0.4 ( 2022-11-17 )
- [x] Dependencies update. @peter.naydenov/fsm version 5.1.1;



### 2.0.3 ( 2023-10-21 )
- [x] Dependency update. Ask-for-promise - v.1.4.0;



### 2.0.2 ( 2022-11-17 )
- [x] Works with `@peter.naydenov/fsm` version 5 and above;



### 2.0.0 ( 2022-11-16 )
- [x] The library become a ES module;



### 1.0.5 ( 2022-05-27 )
 - [x] Just a dependency update;

### 1.0.4 ( 2021-04-02 )
 - [x] Fix: Duplicated update callback if logic contain a chainAction;

### 1.0.3 ( 2021-03-26 )
 - [x] Massive code refactoring;
 - [ ] Bug: Duplicated update callback if logic contain a chainAction;









