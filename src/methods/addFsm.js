/**
 * Create the `addFsm` method of a hub.
 * @param {import('../main.js').HubContext} hub - Hub that receives the FSMs.
 * @param {import('../msg.js').HubMessages} msg - Message templates.
 * @returns {(ins: Record<string, import('../main.js').RegisteredFsm>) => void} `addFsm` method.
 */
function addFsm ( hub, msg ) {
/**
 * Register FSMs by name and listen to their `positive` and `update` events.
 * The hub reacts to an update only if it had at least one successful transition;
 * failed and unknown actions are ignored. A name that is already registered is
 * skipped, with a warning in debug mode.
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


