/**
 * Bind FSM registration to a hub.
 * @param {import('../main.js').HubContext} hub - Hub instance and reaction queues.
 * @param {import('../msg.js').HubMessages} msg - Diagnostic message templates.
 * @returns {(ins: Record<string, import('../main.js').RegisteredFsm>) => void} Bound registration method.
 */
function addFsm ( hub, msg ) {
/**
 * Register named FSM instances and listen to their `positive` and `update` events.
 * The hub reacts to an update only if it had at least one successful transition;
 * failed and unknown actions are ignored. Existing names are skipped and reported
 * through the hub debugger.
 * @param {Record<string, import('../main.js').RegisteredFsm>} ins - FSMs keyed
 * by the names used in reactivity rules.
 * @returns {void}
 * @example
 * hub.addFsm({ source, target });
 */
return function ( ins ) {
            Object.keys(ins).forEach ( name => {
                        if ( hub.fsm[name] ) {
                                        hub._debugger ( msg.REGISTERED_FSM_NAME, name )
                                        return
                            }

                        let transitioned = false;   // A successful transition happened during the current update
                        hub.fsm [name] = ins[name]
                        hub.fsm [name].on ( 'positive', () => transitioned = true )
                        hub.fsm [name].on ( 'update', (state,response) => {
                                        const isSuccess = transitioned;
                                        transitioned = false
                                        if ( isSuccess )   hub._schedule ( name, state, response )
                            })
                })
}} // addFsm func.



export default addFsm


