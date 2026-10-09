/**
 * Diagnostic templates passed to the hub's debugger with one substitution value.
 * @typedef {Object} HubMessages
 * @property {string} WRONG_REACTIVITY_RECORD - Invalid rule; value is its one-based row number.
 * @property {string} REGISTERED_FSM_NAME - Duplicate registration; value is the FSM name.
 * @property {string} REGISTERED_FUNCTION_NAME - Duplicate registration; value is the callback name.
 * @property {string} MISSING_FSM - Unregistered subscriber; value is the FSM name.
 * @property {string} MISSING_FN - Unregistered callback; value is the function name.
 */

/**
 * Shared diagnostic text. Messages are logged only when the hub's debug flag is enabled.
 * @type {HubMessages}
 */
const msg = {   // Error and warnings messages
                  WRONG_REACTIVITY_RECORD  : 'Error: Wrong reactivity record on row %s.'
                , REGISTERED_FSM_NAME      : 'Warning: FSM "%s" is already registered.'
                , REGISTERED_FUNCTION_NAME : 'Warning: Function "%s" is already registered.'
                , MISSING_FSM              : 'Warning: Fsm "%s" is not registered to the hub.'
                , MISSING_FN               : 'Warning: Function "%s" is not registered to the hub.'
            };


export default msg


