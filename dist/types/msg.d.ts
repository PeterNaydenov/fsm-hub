/**
 * Message templates. Each one has a `%s` placeholder for one value.
 * @typedef {Object} HubMessages
 * @property {string} WRONG_REACTIVITY_RECORD Wrong reactivity rule. Value: its row number, from 1.
 * @property {string} REGISTERED_FSM_NAME FSM name is already registered. Value: the name.
 * @property {string} REGISTERED_FUNCTION_NAME Callback name is already registered. Value: the name.
 * @property {string} MISSING_FSM A rule names an FSM that is not registered. Value: the name.
 * @property {string} MISSING_FN A rule names a callback that is not registered. Value: the name.
 * @property {string} LISTENER_ERROR A listener or transformer threw, or a subscriber
 * update rejected. Value: the listener name. Logged with `console.error`, followed by the error.
 */
export type HubMessages = {
    /**
     * Wrong reactivity rule. Value: its row number, from 1.
     */
    WRONG_REACTIVITY_RECORD: string;
    /**
     * FSM name is already registered. Value: the name.
     */
    REGISTERED_FSM_NAME: string;
    /**
     * Callback name is already registered. Value: the name.
     */
    REGISTERED_FUNCTION_NAME: string;
    /**
     * A rule names an FSM that is not registered. Value: the name.
     */
    MISSING_FSM: string;
    /**
     * A rule names a callback that is not registered. Value: the name.
     */
    MISSING_FN: string;
    /**
     * A listener or transformer threw, or a subscriber
     * update rejected. Value: the listener name. Logged with `console.error`, followed by the error.
     */
    LISTENER_ERROR: string;
};
/**
 * Messages of the hub. Warnings are logged with `console.log` in debug mode only.
 * `LISTENER_ERROR` is always logged, with `console.error`.
 * @type {HubMessages}
 */
declare const msg: HubMessages;
export default msg;
