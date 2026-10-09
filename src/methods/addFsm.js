import askForPromise from "ask-for-promise"

/**
 * Bind FSM registration and update scheduling to a hub.
 * @param {import('../main.js').HubContext} hub - Hub instance and reaction queues.
 * @param {import('../msg.js').HubMessages} msg - Diagnostic message templates.
 * @returns {(ins: Record<string, import('../main.js').RegisteredFsm>) => void} Bound registration method.
 */
function addFsm ( hub, msg ) {
/**
 * Register named FSM instances and listen to their `update` events.
 * Existing names are skipped and reported through the hub debugger.
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

                        /**
                         * Release completed reaction flags and process the next queued update.
                         * Internal updates take priority over external updates; draining waits
                         * while another internal reaction is still in progress.
                         * @private
                         * @param {boolean} isInternalRequest - Whether the completed reaction was internal.
                         * @returns {void}
                         */
                        function reactivityComplete ( isInternalRequest ) {
                                
                                        if ( isInternalRequest       )   hub.haveInternalRequest = false
                                        if ( hub.haveInternalRequest )   return

                                        let  
                                             emptyInternalCache = hub.cacheInternal.isEmpty ()
                                           , emptyCache         = hub.cache.isEmpty ()
                                           , emptyBoth          = emptyCache && emptyInternalCache
                                           ;
                                        if ( emptyBoth ) {  
                                                hub.lock = false
                                                return
                                            }
                                        let [ name, state, response ] = ( !emptyInternalCache ) ? hub.cacheInternal.pull () : hub.cache.pull ()                                        
                                        if ( hub.cache.isEmpty ()         )   hub.lock = false
                                        if ( hub.cacheInternal.isEmpty () )   hub.haveInternalRequest = false
                                        hubUpdateWatcher ( name, state, response )
                            } // reactivityComplete func.

                        /**
                         * Dispatch an update or queue it while another reaction is active.
                         * While locked, a truthy response classifies the update as internal;
                         * updates with falsy responses enter the external FIFO queue.
                         * @private
                         * @param {string} name - Registered source FSM name.
                         * @param {string} state - Source FSM's state after the update.
                         * @param {*} response - Source FSM's update response.
                         * @returns {void}
                         */
                        function hubUpdateWatcher ( name, state, response ) {
                                    let executeReactivity;
                                    
                                    if ( !hub.lock ) {
                                                hub.lock = true
                                                executeReactivity = askForPromise ()
                                                executeReactivity.onComplete ( z =>  reactivityComplete ( false ) )   // complete of external reaction
                                                hub._callback ( executeReactivity, name, state, response )
                                                return
                                        }

                                    if ( response ) {
                                                if ( hub.haveInternalRequest ) {
                                                                hub.cacheInternal.push ( [[ name, state, response ]])
                                                                return
                                                    }
                                                let reactivityTask = askForPromise ();
                                                reactivityTask.onComplete ( z => reactivityComplete ( true )  )   // complete of internal reaction
                                                hub.haveInternalRequest = true;
                                                hub._callback ( reactivityTask, name, state, response )
                                                return
                                        }
                                    hub.cache.push ( [[ name, state, response ]])
                            } // hubUpdateWatcher func.



                        hub.fsm [name] = ins[name]
                        hub.fsm [name].on ( 'update', (state,response) => hubUpdateWatcher (name,state,response)   )
                })
}} // addFsm func.



export default addFsm


