# FSM Hub API

These contracts describe `@peter.naydenov/fsm-hub` 2.1.x. Check the installed
version and source when diagnosing different behavior.

## Configuration and registration

```js
const hub = new FsmHub({
    reactivity: [
        ['sourceName', 'observedState', 'subscriberName', 'actionName'],
        ['sourceName', 'observedState', 'callbackName']
    ],
    transformers: { 'sourceName/callbackName': 'transformerName' },
    debug: false
}, {
    transformerName(state, response) { return { state, response } }
})
```

| API | Contract |
| --- | --- |
| `new FsmHub(description, transformerLib?)` | Requires a `reactivity` array; an empty array is valid. `transformers` and `debug` are optional. `transformerLib` may be omitted or `null`. |
| `hub.addFsm({ name: instance })` | Registers instances exposing `on('positive', listener)`, `on('update', listener)` and `update(action, data)`, which returns a promise. The hub reacts to an update only if a `positive` event (a successful transition) came before it. Returns `undefined`. |
| `hub.addFunctions({ name: fn })` | Registers functions called as `fn(data)`. Returns `undefined`; callback return values are ignored. |

Use consistent names in rules and registrations. Source and subscriber machines
both need registration. Register listeners before the first update; the hub
does not replay earlier events. Duplicate registration preserves the existing
value and can log a warning.

An FSM rule specifies a **subscriber action**, not the subscriber's destination
state. The destination comes from that machine's behavior table. For
`@peter.naydenov/fsm` 5.x, the configuration key is `behavior`; its transition
functions complete with `task.done({ success, response?, stateData? })`.

## Reactivity and transformations

- Three-element rows invoke function callbacks; four-element rows invoke FSM
  updates. Non-array rows and rows of other lengths are skipped. Diagnostics
  identify invalid rows by one-based index.
- Rules are indexed by `source/state`. FSM actions are indexed by
  `source/state/subscriber` as lists in rule order. Listener lists retain
  duplicates; each repeated rule sends its own action.
- Transformers are keyed by `source/listener`, without the source state. Each
  transformer applies to every matching rule for that source and listener.
- The description contains transformer **names**; the second constructor
  argument supplies the corresponding functions. Missing transformer functions
  fall back to the original response.
- Transformers run synchronously. A returned promise becomes listener input;
  its resolved value is not extracted by the hub.

## Dispatch, completion, and queues

Subscriber FSM updates start first in their rule order. Function callbacks then
run in their rule order, before the subscriber update promises have necessarily
resolved. Internal reaction tasks finish after the immediate subscriber promises
resolve and the function callbacks have been invoked. Async callback results
are ignored. A subscriber transition that never calls `task.done` keeps the
reaction open, and the hub waits for it; queued updates do not run until it
finishes.

The source FSM's update promise represents that machine's work. For completion
of an orchestration, create a promise or use an existing application signal
resolved by the final listener. There is no public `hub.update()`, `hub.done()`,
`hub.removeFsm()`, or unsubscribe API.

The hub runs one reaction at a time. During a reaction, an update from an FSM
that this reaction is updating is internal; every other update is external.
Both wait in FIFO queues, and internal updates run first, so a cascade finishes
before unrelated updates. Response values play no part in this. Scheduling lives
in `_schedule.js`.

The hub ignores updates without a successful transition: unknown actions and
transitions that finish with `success: false`. A successful transition to the
same state still triggers reactions. In a chain, one successful step is enough.

Listeners receive data unchanged, including `0`, `false`, `''`, `null`, and
`undefined`. Every listener of an update receives the same response object;
prefer fresh transformer objects when listeners need isolation.

Transformer errors, thrown callbacks, and rejected subscriber promises are
caught and logged with `console.error('Error: Listener "%s" failed.', name, error)`,
also without `debug`. The other listeners still run, and the hub goes on to the
next queued update. Handle errors where they originate when the application must
react to them. Avoid reaction cycles unless the application has a terminating
condition.

## Diagnostics and TypeScript

Set `debug: true` to log malformed reactivity rows, duplicate registrations, and
missing FSMs or callbacks. For a missing reaction, check the source's actual
update state, all registration names, the subscriber action, and transformer
names. A hub callback takes `data`, not `(state, response)`.

The package exposes generated declarations through `types` and its root export.
Import `HubDescription`, `ReactivityRule`, `TransformerLibrary`, `RegisteredFsm`,
or `ListenerCallback` as types when useful. Payloads use `any`; define application
payload types and checks when more precise contracts are needed.

Declarations are generated from source JSDoc with `npm run build:types`.
`FsmHubConstructor` supplies the constructible API because methods are attached
dynamically. `npm run test:types` checks consumers through the package entry point.
