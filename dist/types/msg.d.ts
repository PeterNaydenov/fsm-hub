/**
 * Diagnostic templates passed to the hub's debugger with one substitution value.
 * @typedef {Object} HubMessages
 * @property {string} WRONG_REACTIVITY_RECORD - Invalid rule; value is its one-based row number.
 * @property {string} REGISTERED_FSM_NAME - Duplicate registration; value is the FSM name.
 * @property {string} REGISTERED_FUNCTION_NAME - Duplicate registration; value is the callback name.
 * @property {string} MISSING_FSM - Unregistered subscriber; value is the FSM name.
 * @property {string} MISSING_FN - Unregistered callback; value is the function name.
 */
export type HubMessages = {
    /**
     * - Invalid rule; value is its one-based row number.
     */
    WRONG_REACTIVITY_RECORD: string;
    /**
     * - Duplicate registration; value is the FSM name.
     */
    REGISTERED_FSM_NAME: string;
    /**
     * - Duplicate registration; value is the callback name.
     */
    REGISTERED_FUNCTION_NAME: string;
    /**
     * - Unregistered subscriber; value is the FSM name.
     */
    MISSING_FSM: string;
    /**
     * - Unregistered callback; value is the function name.
     */
    MISSING_FN: string;
};
/**
 * Shared diagnostic text. Messages are logged only when the hub's debug flag is enabled.
 * @type {HubMessages}
 */
declare const msg: HubMessages;
export default msg;
