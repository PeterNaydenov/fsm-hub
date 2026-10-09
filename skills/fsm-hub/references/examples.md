# Complete orchestration example

This example uses `@peter.naydenov/fsm` 5.x and `@peter.naydenov/fsm-hub` 2.1.x.
Both packages must be available in the consumer project. Run it as an ES module.

The controller activates the worker, then a worker callback resolves an
application-owned promise with the transformed result.

```js
import assert from 'node:assert/strict'
import Fsm from '@peter.naydenov/fsm'
import FsmHub from '@peter.naydenov/fsm-hub'

const controller = new Fsm({
    init: 'idle',
    behavior: [['idle', 'activate', 'active', 'activate']]
}, {
    activate({ task }, input) {
        task.done({ success: true, response: input })
    }
})

const worker = new Fsm({
    init: 'idle',
    behavior: [['idle', 'activate', 'active', 'activate']]
}, {
    activate({ task }, input) {
        task.done({ success: true, response: input })
    }
})

let completeReport
const reported = new Promise(resolve => { completeReport = resolve })

const hub = new FsmHub({
    reactivity: [
        ['controller', 'active', 'worker', 'activate'],
        ['worker', 'active', 'report']
    ],
    transformers: { 'worker/report': 'toReport' }
}, {
    toReport: (state, response) => ({ state, response })
})

hub.addFsm({ controller, worker })
hub.addFunctions({ report: data => completeReport(data) })

await controller.update('activate', { message: 'ready' })
const result = await reported

assert.equal(worker.getState(), 'active')
assert.deepEqual(result, {
    state: 'active',
    response: { message: 'ready' }
})
```

Await `reported` to observe the final listener. Awaiting only the controller
update does not establish that downstream reactions have completed. For tests,
use the test runner's timeout so a missing callback fails instead of hanging.

## TypeScript configuration

Use a type annotation for a separately declared configuration object so its
reactivity rows retain their tuple types:

```ts
import FsmHub, { type HubDescription } from '@peter.naydenov/fsm-hub'

const description: HubDescription = {
    reactivity: [['worker', 'active', 'report']]
}
const hub = new FsmHub(description)
hub.addFunctions({ report: (data: { message: string } | null) => {
    if (data !== null) console.log(data.message)
} })
```

This callback annotation documents the application's expected payload; the
library's `any` payload type does not validate incoming data. Configure a
transformer or validate at the application boundary if the source can supply
other shapes.
