import methods from './methods/index.js';
import askForPromise from 'ask-for-promise';
export type ReactivityRule = [string, string, string] | [string, string, string, string];
export type Transformer = (state: string, response: any) => any;
export type TransformerLibrary = Record<string, Transformer>;
export type HubDescription = {
    /**
     * - Rules in execution order within
     * each listener type. FSM subscribers run before callback functions.
     */
    reactivity: Array<ReactivityRule>;
    /**
     * - Map of `source/listener`
     * keys to function names in the transformer library.
     */
    transformers?: Record<string, string>;
    /**
     * - Enable diagnostic logging.
     */
    debug?: boolean;
};
export type ListenerCallback = (data: any) => any;
export type RegisteredFsm = {
    /**
     * - Register
     * a listener. The hub listens to `positive` (a successful transition) and `update`
     * (the update is complete). It reacts only to updates with a successful transition.
     */
    on: (event: 'positive' | 'update', listener: (state: string, response?: any) => void) => void;
    /**
     * - Execute an
     * action and resolve with its response.
     */
    update: (action: string, data?: any) => Promise<any>;
};
export type ReactionTables = {
    /**
     * - Functions keyed by `source/listener`.
     */
    transformers: TransformerLibrary;
    /**
     * - FSM names keyed by `source/state`.
     */
    subscribers: Record<string, Array<string>>;
    /**
     * - Actions keyed by `source/state/subscriber`,
     * one per rule in rule order.
     */
    actions: Record<string, Array<string>>;
    /**
     * - Callback names keyed by `source/state`.
     */
    callbacks: Record<string, Array<string>>;
};
export type HubContext = {
    /**
     * - Registered FSMs by name.
     */
    fsm: Record<string, RegisteredFsm>;
    /**
     * - Registered callbacks by name.
     */
    fnCallbacks: Record<string, ListenerCallback>;
    /**
     * - Whether diagnostics are logged.
     */
    debug: boolean;
    /**
     * - FIFO queue of external updates.
     */
    cache: import('@peter.naydenov/stack').Stack;
    /**
     * - FIFO queue of internal updates, drained first.
     */
    cacheInternal: import('@peter.naydenov/stack').Stack;
    /**
     * - Reserved storage initialized to an empty array.
     */
    wait: Array<any>;
    /**
     * - Whether a reaction is in progress.
     */
    lock: boolean;
    /**
     * - FSM names the running reaction updates. Their
     * updates are internal and wait in `cacheInternal`.
     */
    updating: Set<string>;
    /**
     * - Reserved flag initialized to false.
     */
    reactivityTask: boolean;
    /**
     * - Promise-task factory.
     */
    askForPromise: typeof askForPromise;
    /**
     * - Functions keyed by `source/listener`.
     */
    transformers: TransformerLibrary;
    /**
     * - FSM names keyed by `source/state`.
     */
    subscribers: Record<string, Array<string>>;
    /**
     * - Actions keyed by `source/state/subscriber`,
     * one per rule in rule order.
     */
    actions: Record<string, Array<string>>;
    /**
     * - Callback names keyed by `source/state`.
     */
    callbacks: Record<string, Array<string>>;
    /**
     * - Register named FSM instances.
     */
    addFsm: ReturnType<typeof methods.addFsm>;
    /**
     * - Register named callbacks.
     */
    addFunctions: ReturnType<typeof methods.addFunctions>;
    /**
     * - Compile reaction tables.
     */
    _setTransitions: ReturnType<typeof methods._setTransitions>;
    /**
     * - Dispatch an update to its listeners.
     */
    _callback: ReturnType<typeof methods._callback>;
    /**
     * - Run reactions one at a time.
     */
    _schedule: ReturnType<typeof methods._schedule>;
    /**
     * - Log diagnostics when enabled.
     */
    _debugger: ReturnType<typeof methods._debugger>;
};
export type FsmHubConstructor = {
    new (machine: HubDescription, transformerLib?: TransformerLibrary | null): HubContext;
};
declare const _default: FsmHubConstructor;
export default _default;
