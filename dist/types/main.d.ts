import methods from './methods/index.js';
export type ReactivityRule = [source: string, state: string, callback: string] | [source: string, state: string, subscriber: string, action: string];
export type Transformer = (state: string, response: any) => any;
export type TransformerLibrary = Record<string, Transformer>;
export type HubDescription = {
    /**
     * Rules. FSM subscribers of an
     * update run first, then callback functions, each in rule order.
     */
    reactivity: Array<ReactivityRule>;
    /**
     * Transformer names by
     * `source/listener` key, e.g. `{ 'door/alarm': 'toAlarm' }`. A transformer applies
     * to every state of the source.
     */
    transformers?: Record<string, string>;
    /**
     * Log warnings about wrong rules, repeated
     * names and missing listeners with `console.log`.
     */
    debug?: boolean;
};
export type ListenerCallback = (data: any) => any;
export type RegisteredFsm = {
    /**
     * Register an event listener. The hub listens to `positive` (a successful
     * transition) and `update` (the update is complete). It reacts only to updates
     * with a successful transition.
     */
    on: (event: 'positive' | 'update', listener: (state: string, response?: any) => void) => void;
    /**
     * Run an action. Resolves with the transition's response.
     */
    update: (action: string, data?: any) => Promise<any>;
};
export type ReactionTables = {
    /**
     * Transformer functions by `source/listener`.
     */
    transformers: TransformerLibrary;
    /**
     * Subscriber FSM names by `source/state`, in rule order.
     */
    subscribers: Record<string, Array<string>>;
    /**
     * Actions by `source/state/subscriber`, one per rule, in rule order.
     */
    actions: Record<string, Array<string>>;
    /**
     * Callback names by `source/state`, in rule order.
     */
    callbacks: Record<string, Array<string>>;
};
export type HubContext = {
    /**
     * Registered FSMs by name.
     */
    fsm: Record<string, RegisteredFsm>;
    /**
     * Register FSMs by name:
     * `hub.addFsm({ door, alarm })`. The names are the ones used in reactivity rules.
     * The hub reacts to an FSM update only if it had a successful transition. A name
     * that is already registered is skipped, with a warning in debug mode.
     */
    addFsm: ReturnType<typeof methods.addFsm>;
    /**
     * Register callback
     * functions by name: `hub.addFunctions({ report })`. Each one is called as `fn(data)`.
     * A name that is already registered is skipped, with a warning in debug mode.
     */
    addFunctions: ReturnType<typeof methods.addFunctions>;
    /**
     * Internal. Registered callbacks by name.
     */
    fnCallbacks: Record<string, ListenerCallback>;
    /**
     * Internal. Whether warnings are logged.
     */
    debug: boolean;
    /**
     * Internal. FIFO queue of
     * external updates, as `[source, state, response]`.
     */
    cache: import('@peter.naydenov/stack').Stack;
    /**
     * Internal. FIFO queue
     * of internal updates, as `[source, state, response]`. Runs before `cache`.
     */
    cacheInternal: import('@peter.naydenov/stack').Stack;
    /**
     * Internal. Whether a reaction is running.
     */
    lock: boolean;
    /**
     * Internal. FSMs that the running reaction updates.
     * Their updates are internal.
     */
    updating: Set<string>;
    /**
     * Internal. Transformer functions by `source/listener`.
     */
    transformers: TransformerLibrary;
    /**
     * Internal. Subscriber FSM names by `source/state`.
     */
    subscribers: Record<string, Array<string>>;
    /**
     * Internal. Actions by `source/state/subscriber`, one per rule.
     */
    actions: Record<string, Array<string>>;
    /**
     * Internal. Callback names by `source/state`.
     */
    callbacks: Record<string, Array<string>>;
    /**
     * Internal. Compile the reaction tables.
     */
    _setTransitions: ReturnType<typeof methods._setTransitions>;
    /**
     * Internal. Send an update to its listeners.
     */
    _callback: ReturnType<typeof methods._callback>;
    /**
     * Internal. Run reactions one at a time.
     */
    _schedule: ReturnType<typeof methods._schedule>;
    /**
     * Internal. Log a warning in debug mode.
     */
    _debugger: ReturnType<typeof methods._debugger>;
};
export type FsmHubConstructor = {
    new (description: HubDescription, transformerLib?: TransformerLibrary | null): HubContext;
};
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
declare const _default: FsmHubConstructor;
export default _default;
