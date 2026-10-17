import FsmHub = require('@peter.naydenov/fsm-hub');
import Fsm = require('@peter.naydenov/fsm');

// `module.exports = FsmHub`: the required value is the constructor, with types on its namespace.
const description: FsmHub.HubDescription = {
    reactivity: [['source', 'active', 'report']],
    transformers: { 'source/report': 'toReport' }
};
const transformers: FsmHub.TransformerLibrary = {
    toReport: (state, response) => ({ state, response })
};
const hub = new FsmHub(description, transformers);
const source: FsmHub.RegisteredFsm = new Fsm({
    init: 'idle',
    behavior: [['idle', 'activate', 'active', 'switchOn']]
});

hub.addFsm({ source });
hub.addFunctions({ report: data => console.log(data) });
const update: Promise<any> = hub.fsm.source.update('activate');

// @ts-expect-error The hub description requires a reactivity table.
new FsmHub({ debug: true });
// @ts-expect-error The CommonJS export has no 'default' property.
FsmHub.default;
