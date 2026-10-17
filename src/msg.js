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

/**
 * Messages of the hub. Warnings are logged with `console.log` in debug mode only.
 * `LISTENER_ERROR` is always logged, with `console.error`.
 * @type {HubMessages}
 */
const msg = {   // Error and warnings messages
                  WRONG_REACTIVITY_RECORD  : 'Error: Wrong reactivity record on row %s.'
                , REGISTERED_FSM_NAME      : 'Warning: FSM "%s" is already registered.'
                , REGISTERED_FUNCTION_NAME : 'Warning: Function "%s" is already registered.'
                , MISSING_FSM              : 'Warning: Fsm "%s" is not registered to the hub.'
                , MISSING_FN               : 'Warning: Function "%s" is not registered to the hub.'
                , LISTENER_ERROR           : 'Error: Listener "%s" failed.'
            };


export default msg


