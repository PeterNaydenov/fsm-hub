import FsmHub, {
    type HubDescription,
    type RegisteredFsm,
    type TransformerLibrary
} from '@peter.naydenov/fsm-hub';
import Fsm from '@peter.naydenov/fsm';

const description: HubDescription = {
    reactivity: [
        ['source', 'active', 'target', 'activate'],
        ['target', 'active', 'report']
    ],
    transformers: { 'target/report': 'toReport' },
    debug: true
};
const transformers: TransformerLibrary = {
    toReport(state, response) {
        const observedState: string = state;
        return { state: observedState, response };
    }
};
const hub = new FsmHub(description, transformers);
const source: RegisteredFsm = new Fsm({
    init: 'idle',
    behavior: [['idle', 'activate', 'active', 'switchOn']]
});

hub.addFsm({ source });
hub.addFunctions({ report: data => console.log(data) });
const update: Promise<any> = hub.fsm.source.update('activate', { message: 'ready' });
const empty: boolean = hub.cache.isEmpty();
new FsmHub({ reactivity: [] });
new FsmHub({ reactivity: [] }, null);
const actions: string[] = hub.actions['source/active/target'];

// @ts-expect-error The hub description requires a reactivity table.
new FsmHub({ debug: true });

// @ts-expect-error Reactivity rows require three or four elements.
new FsmHub({ reactivity: [['source', 'active']] });

// @ts-expect-error Transformer libraries contain functions, not function names.
new FsmHub(description, { toReport: 'toReport' });

// @ts-expect-error Registered FSMs must expose both on() and update().
hub.addFsm({ incomplete: { update: async () => undefined } });

// @ts-expect-error Callback registrations must be functions.
hub.addFunctions({ report: 'report' });
