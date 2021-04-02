const askForPromise = require("ask-for-promise")

function addFsm ( hub, msg ) {
return function ( ins ) {
            Object.keys(ins).forEach ( name => {
                        if ( hub.fsm[name] ) {
                                        hub._debugger ( msg.REGISTERED_FSM_NAME, name )
                                        return
                            }

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



                        function hubUpdateWatcher (name,state,response) {
                                    let executeReactivity;
                                    if ( !hub.lock ) {
                                                hub.lock = true
                                                executeReactivity = askForPromise ()
                                                executeReactivity.onComplete ( z =>  reactivityComplete ( false ) )   // complete of external reaction
                                                hub._callback ( executeReactivity, name, state, response )
                                                return
                                        }

                                    if ( response && response.___internalFlag ) {
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



module.exports = addFsm


