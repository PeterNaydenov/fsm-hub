import methods from './methods/index.js'
import msg from './msg.js'
import stack from '@peter.naydenov/stack'

/**
 * Reactivity rule. Three elements: when `source` reaches `state`, call the
 * function `callback`. Four elements: when `source` reaches `state`, run
 * `action` on the FSM `subscriber`.
 * @typedef {[source: string, state: string, callback: string]|[source: string, state: string, subscriber: string, action: string]} ReactivityRule
 */

/**
 * Change an update response before it reaches one listener. Runs synchronously;
 * a returned promise reaches the listener as it is.
 * @callback Transformer
 * @param {string} state - Source FSM's state after its update.
 * @param {*} response - Source FSM's update response.
 * @returns {*} Input for the subscriber FSM or the callback function.
 */

/**
 * Transformer functions by name. The hub description refers to them by name.
 * @typedef {Record<string, Transformer>} TransformerLibrary
 */

/**
 * Hub configuration, the first argument of `new FsmHub()`.
 * @typedef {Object} HubDescription
 * @property {Array<ReactivityRule>} reactivity Rules. FSM subscribers of an
 * update run first, then callback functions, each in rule order.
 * @property {Record<string, string>} [transformers] Transformer names by
 * `source/listener` key, e.g. `{ 'door/alarm': 'toAlarm' }`. A transformer applies
 * to every state of the source.
 * @property {boolean} [debug=false] Log warnings about wrong rules, repeated
 * names and missing listeners with `console.log`.
 */

/**
 * Callback function. Receives the update response, or the transformer's result.
 * @callback ListenerCallback
 * @param {*} data - Listener input, unchanged, including falsy values.
 * @returns {*} Ignored by the hub, including returned promises.
 */

/**
 * What the hub needs from a registered FSM. `@peter.naydenov/fsm` instances fit.
 * @typedef {Object} RegisteredFsm
 * @property {(event: 'positive' | 'update', listener: (state: string, response?: any) => void) => void} on
 * Register an event listener. The hub listens to `positive` (a successful
 * transition) and `update` (the update is complete). It reacts only to updates
 * with a successful transition.
 * @property {(action: string, data?: any) => Promise<any>} update
 * Run an action. Resolves with the transition's response.
 */

/**
 * Lookup tables compiled from the hub description.
 * @typedef {Object} ReactionTables
 * @property {TransformerLibrary} transformers Transformer functions by `source/listener`.
 * @property {Record<string, Array<string>>} subscribers Subscriber FSM names by `source/state`, in rule order.
 * @property {Record<string, Array<string>>} actions Actions by `source/state/subscriber`, one per rule, in rule order.
 * @property {Record<string, Array<string>>} callbacks Callback names by `source/state`, in rule order.
 */

/**
 * Hub instance. Use `fsm`, `addFsm` and `addFunctions`; the other members are
 * internal and can change in any version.
 * @typedef {Object} HubContext
 * @property {Record<string, RegisteredFsm>} fsm Registered FSMs by name.
 * @property {ReturnType<typeof methods.addFsm>} addFsm Register FSMs by name:
 * `hub.addFsm({ door, alarm })`. The names are the ones used in reactivity rules.
 * The hub reacts to an FSM update only if it had a successful transition. A name
 * that is already registered is skipped, with a warning in debug mode.
 * @property {ReturnType<typeof methods.addFunctions>} addFunctions Register callback
 * functions by name: `hub.addFunctions({ report })`. Each one is called as `fn(data)`.
 * A name that is already registered is skipped, with a warning in debug mode.
 * @property {Record<string, ListenerCallback>} fnCallbacks Internal. Registered callbacks by name.
 * @property {boolean} debug Internal. Whether warnings are logged.
 * @property {import('@peter.naydenov/stack').Stack} cache Internal. FIFO queue of
 * external updates, as `[source, state, response]`.
 * @property {import('@peter.naydenov/stack').Stack} cacheInternal Internal. FIFO queue
 * of internal updates, as `[source, state, response]`. Runs before `cache`.
 * @property {boolean} lock Internal. Whether a reaction is running.
 * @property {Set<string>} updating Internal. FSMs that the running reaction updates.
 * Their updates are internal.
 * @property {TransformerLibrary} transformers Internal. Transformer functions by `source/listener`.
 * @property {Record<string, Array<string>>} subscribers Internal. Subscriber FSM names by `source/state`.
 * @property {Record<string, Array<string>>} actions Internal. Actions by `source/state/subscriber`, one per rule.
 * @property {Record<string, Array<string>>} callbacks Internal. Callback names by `source/state`.
 * @property {ReturnType<typeof methods._setTransitions>} _setTransitions Internal. Compile the reaction tables.
 * @property {ReturnType<typeof methods._callback>} _callback Internal. Send an update to its listeners.
 * @property {ReturnType<typeof methods._schedule>} _schedule Internal. Run reactions one at a time.
 * @property {ReturnType<typeof methods._debugger>} _debugger Internal. Log a warning in debug mode.
 */

/**
 * Hub constructor type. Methods are attached to each instance.
 * @typedef {{new(description: HubDescription, transformerLib?: TransformerLibrary | null): HubContext}} FsmHubConstructor
 */

/**
 * Create a hub. Its reactions are defined in `description`.
 * @constructor
 * @this {HubContext}
 * @param {HubDescription} description - Reactivity rules, transformer names and debug flag.
 * @param {TransformerLibrary|null} [transformerLib={}] - Transformer functions by name. `null` works like `{}`.
 */
function FsmHub ( description, transformerLib ) {
   const 
          hub = this
        , fnKeys = Object.keys ( methods )
        ;
        hub.fsm = Object.create ( null )            // Fsm's placeholder. No prototype: names like 'constructor' are free
        hub.fnCallbacks = Object.create ( null )    // Callback functions place
        hub.debug = description.debug || false
        hub.cache = stack ({ type : 'FIFO' })
        hub.cacheInternal = stack ({ type: 'FIFO' })
        hub.lock = false
        hub.updating = new Set ()

        fnKeys.forEach ( k => {   // Attach methods to fsmHub
                  hub[k] = methods[k]( hub, msg )   
            })   

        const { transformers, subscribers, actions, callbacks } = hub._setTransitions ( description, transformerLib );
        hub.transformers = transformers  // Data transformation function with format 'fsm/fsmListener' or 'fsm/function'
        hub.subscribers  = subscribers   // List of fsm names that are listening for 'fsm/state' changes
        hub.actions      = actions       // Fsm action that should be applied on 'fsm/state/listener' 
        hub.callbacks    = callbacks     // List of functional callbacks
} // FsmHub class



/**
 * Hub that connects finite state machines. When a registered FSM reaches a
 * state, the hub runs the matching reactivity rules: it sends actions to other
 * FSMs and calls callback functions.
 *
 * Register FSMs with `addFsm()` and callbacks with `addFunctions()` before the
 * first update. The hub reacts only to updates with a successful transition and
 * runs one reaction at a time. Errors in listeners are logged with `console.error`.
 * @example
 * import Fsm    from '@peter.naydenov/fsm'
 * import FsmHub from '@peter.naydenov/fsm-hub'
 *
 * const hub = new FsmHub({
 *     reactivity: [
 *         ['source', 'active', 'target', 'activate'],   // FSM rule
 *         ['target', 'active', 'report']                // callback rule
 *     ],
 *     transformers: { 'target/report': 'toReport' }
 * }, {
 *     toReport: (state, response) => ({ state, response })
 * });
 * hub.addFsm({ source, target });   // Fsm instances
 * hub.addFunctions({ report: data => console.log(data) });
 * source.update('activate', { message: 'ready' });
 */
export default /** @type {FsmHubConstructor} */ (FsmHub)


