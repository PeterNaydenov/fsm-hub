---
name: fsm-hub
description: Builds, integrates, and debugs FSM orchestration using @peter.naydenov/fsm-hub. Applies when a task uses this package, defines hub reactivity rules, registers machines or callback functions, transforms update responses, diagnoses reaction queues, or maintains the library's JSDoc and generated TypeScript declarations. Targets this library rather than unrelated finite-state-machine implementations.
---

# FSM Hub

Implement the requested orchestration with `@peter.naydenov/fsm-hub`, preserving
the application's machine names, states, actions, and integration choices.

## Workflow

1. Inspect existing machines, hub configuration, and installed package version.
   The references describe 3.x; resolve differences against installed source,
   JSDoc, and declarations.
2. Map each observed source state to an action in another FSM or a function
   callback. Use `[source, state, subscriber, action]` for FSMs and
   `[source, state, callback]` for functions.
3. Register every source, subscriber, and callback before triggering updates.
   Registration names must match the rules; registration does not create rules.
4. Use a transformer when a listener needs a different payload. Map
   `source/listener` to a library function name; provide that function as the
   constructor's second argument.
5. Verify the resulting subscriber state and callback data. When completion of
   the whole reaction matters, observe an application-owned completion signal
   from the final listener.

## Minimal pattern

Given existing `source` and `target` FSM instances:

```js
import FsmHub from '@peter.naydenov/fsm-hub'

const hub = new FsmHub({
    reactivity: [
        ['source', 'active', 'target', 'activate'],
        ['target', 'active', 'report']
    ],
    transformers: { 'target/report': 'toReport' }
}, {
    toReport: (state, response) => ({ state, response })
})

hub.addFsm({ source, target })
hub.addFunctions({ report: data => console.log(data) })
source.update('activate', { message: 'ready' })
```

## Contracts that affect implementation

- A hub callback receives **one data argument**. A transformer receives
  `(state, response)` and returns that listener's input. Returning a promise
  from either does not make the hub await it as a callback or transformation.
- The hub starts subscriber FSM updates before invoking function callbacks;
  it does not wait for those FSM updates before calling the functions.
- `addFsm()` and `addFunctions()` return `undefined`. Duplicate registrations
  keep the original instance or function. Missing listeners are skipped and
  reported only when `debug` is enabled.
- Awaiting a source FSM's `update()` does not guarantee completion of all
  downstream hub reactions. The hub has no public completion or removal method.
- For queue, falsy-payload, or error-handling issues, read the runtime contracts
  in [references/api.md](references/api.md) before changing behavior.

## Read details as needed

- Read [references/api.md](references/api.md) for configuration, public methods,
  ordering, diagnostics, and TypeScript contracts.
- Read [references/examples.md](references/examples.md) for a complete two-FSM
  integration with transformation and explicit completion.
- Use [evals/evals.json](evals/evals.json) when evaluating or revising this skill.
  Assess the implementation against the expected behavior, not matching prose.

## Working on the library itself

Keep JSDoc in `src/` as the type source. Register new method factories in
`src/methods/index.js` and update `HubContext` and its constructor type as needed.
Generate declarations instead of editing `dist/types/` by hand. Run the relevant
checks from the repository root:

```sh
npm test
npm run test:types
npm run build
```

For consumer projects, use their existing test and build commands.
