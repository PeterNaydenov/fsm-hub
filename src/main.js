import methods from './methods/index.js'
import msg from './msg.js'
import askForPromise from 'ask-for-promise'
import stack from '@peter.naydenov/stack'

/**
 * Reactivity row: source FSM, observed state, and callback name, or source FSM,
 * observed state, subscriber FSM, and action to send to that subscriber.
 * @typedef {[string, string, string]|[string, string, string, string]} ReactivityRule
 */

/**
 * Transform an update response before passing it to a particular listener.
 * @callback Transformer
 * @param {string} state - Source FSM's state after its update.
 * @param {*} response - Source FSM's update response.
 * @returns {*} Input for the subscriber FSM or callback function.
 */

/**
 * Named transformer functions referenced by the hub description.
 * @typedef {Record<string, Transformer>} TransformerLibrary
 */

/**
 * Configuration supplied when constructing a hub.
 * @typedef {Object} HubDescription
 * @property {Array<ReactivityRule>} reactivity - Rules in execution order within
 * each listener type. FSM subscribers run before callback functions.
 * @property {Record<string, string>} [transformers] - Map of `source/listener`
 * keys to function names in the transformer library.
 * @property {boolean} [debug=false] - Enable diagnostic logging.
 */

/**
 * Receive an update response, optionally transformed for this callback.
 * @callback ListenerCallback
 * @param {*} data - Listener input; may be null or undefined.
 * @returns {*} Ignored by the hub, including returned promises.
 */

/**
 * The FSM interface required for hub registration.
 * @typedef {Object} RegisteredFsm
 * @property {(event: 'positive' | 'update', listener: (state: string, response?: any) => void) => void} on - Register
 * a listener. The hub listens to `positive` (a successful transition) and `update`
 * (the update is complete). It reacts only to updates with a successful transition.
 * @property {(action: string, data?: any) => Promise<any>} update - Execute an
 * action and resolve with its response.
 */

/**
 * Lookup tables compiled from the hub description.
 * @typedef {Object} ReactionTables
 * @property {TransformerLibrary} transformers - Functions keyed by `source/listener`.
 * @property {Record<string, Array<string>>} subscribers - FSM names keyed by `source/state`.
 * @property {Record<string, string>} actions - Actions keyed by `source/state/subscriber`.
 * @property {Record<string, Array<string>>} callbacks - Callback names keyed by `source/state`.
 */

/**
 * Hub instance captured by the method factories. Queues store
 * `[sourceName, state, response]` tuples.
 * @typedef {Object} HubContext
 * @property {Record<string, RegisteredFsm>} fsm - Registered FSMs by name.
 * @property {Record<string, ListenerCallback>} fnCallbacks - Registered callbacks by name.
 * @property {boolean} debug - Whether diagnostics are logged.
 * @property {import('@peter.naydenov/stack').Stack} cache - FIFO queue of external updates.
 * @property {import('@peter.naydenov/stack').Stack} cacheInternal - FIFO queue of internal updates, drained first.
 * @property {Array<*>} wait - Reserved storage initialized to an empty array.
 * @property {boolean} lock - Whether a reaction is in progress.
 * @property {Set<string>} updating - FSM names the running reaction updates. Their
 * updates are internal and wait in `cacheInternal`.
 * @property {boolean} reactivityTask - Reserved flag initialized to false.
 * @property {typeof askForPromise} askForPromise - Promise-task factory.
 * @property {TransformerLibrary} transformers - Functions keyed by `source/listener`.
 * @property {Record<string, Array<string>>} subscribers - FSM names keyed by `source/state`.
 * @property {Record<string, string>} actions - Actions keyed by `source/state/subscriber`.
 * @property {Record<string, Array<string>>} callbacks - Callback names keyed by `source/state`.
 * @property {ReturnType<typeof methods.addFsm>} addFsm - Register named FSM instances.
 * @property {ReturnType<typeof methods.addFunctions>} addFunctions - Register named callbacks.
 * @property {ReturnType<typeof methods._setTransitions>} _setTransitions - Compile reaction tables.
 * @property {ReturnType<typeof methods._callback>} _callback - Dispatch an update to its listeners.
 * @property {ReturnType<typeof methods._schedule>} _schedule - Run reactions one at a time.
 * @property {ReturnType<typeof methods._debugger>} _debugger - Log diagnostics when enabled.
 */

/**
 * Constructible entry point, including methods attached dynamically to each hub.
 * @typedef {{new(machine: HubDescription, transformerLib?: TransformerLibrary): HubContext}} FsmHubConstructor
 */

/**
 * Create a hub that reacts to updates from named finite state machines.
 * Register machines with `addFsm()` and listeners with `addFunctions()` before
 * triggering updates. Each instance owns its registration and reaction tables.
 *
 * @constructor
 * @this {HubContext}
 * @param {HubDescription} machine - Reactivity rules and optional transformer mapping.
 * @param {TransformerLibrary} [transformerLib={}] - Named transformation functions.
 * @example
 * const hub = new FsmHub({
 *     reactivity: [
 *         ['source', 'active', 'target', 'activate'],
 *         ['target', 'active', 'report']
 *     ],
 *     transformers: { 'target/report': 'toReport' }
 * }, {
 *     toReport: (state, response) => ({ state, response })
 * });
 * hub.addFsm({ source, target }); // Existing FSM instances.
 * hub.addFunctions({ report: data => console.log(data) });
 * source.update('activate', { message: 'ready' });
 */
function FsmHub ( machine, transformerLib ) {
   const 
          hub = this
        , fnKeys = Object.keys ( methods )
        ;
        hub.fsm = Object.create ( null )            // Fsm's placeholder. No prototype: names like 'constructor' are free
        hub.fnCallbacks = Object.create ( null )    // Callback functions place
        hub.debug = machine.debug || false
        hub.cache = stack ({ type : 'FIFO' })
        hub.cacheInternal = stack ({ type: 'FIFO' })
        hub.wait = []
        hub.lock = false
        hub.updating = new Set ()
        hub.reactivityTask = false
        hub.askForPromise = askForPromise

        fnKeys.forEach ( k => {   // Attach methods to fsmHub
                  hub[k] = methods[k]( hub, msg )   
            })   

        const { transformers, subscribers, actions, callbacks } = hub._setTransitions ( machine, transformerLib );
        hub.transformers = transformers  // Data transformation function with format 'fsm/fsmListener' or 'fsm/function'
        hub.subscribers  = subscribers   // List of fsm names that are listening for 'fsm/state' changes
        hub.actions      = actions       // Fsm action that should be applied on 'fsm/state/listener' 
        hub.callbacks    = callbacks     // List of functional callbacks
} // FsmHub class



export default /** @type {FsmHubConstructor} */ (FsmHub)


