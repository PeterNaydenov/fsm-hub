function _callback ( hub, msg ) {
return function ( fsmName, state, response ) {
    const 
          itemKey        = `${fsmName}/${state}`
        , fsmSubscriber  = hub.subscribers[itemKey] || false
        , callbackNames  = hub.callbacks[itemKey]   || false
        , fnCallbacks    = hub.fnCallbacks          
        , act = hub.actions
        ;
    let data, wait;

    if ( fsmSubscriber ) {
                fsmSubscriber.forEach ( subscriberName => {
                                                if ( !hub.fsm[ subscriberName ] )   {
                                                        hub._debugger ( msg.MISSING_FSM, fsmSubscriber )
                                                        return
                                                    }
                                                const 
                                                      actionKey = `${itemKey}/${subscriberName}`
                                                    , action = act [actionKey]
                                                    , transformerKey = `${fsmName}/${subscriberName}`
                                                    , transformFn = hub.transformers [transformerKey]
                                                    ;
                                                if ( typeof transformFn == 'function' )   data = transformFn (state, response )
                                                else                                      data = response
                                                hub.wait = hub.fsm [ subscriberName ].update ( action, data )
                                        })
        } // if fsmSubscriber
    if ( callbackNames ) {
                if ( hub.wait )  wait = hub.wait
                else             wait = Promise.resolve ()
                wait.then ( () => {
                        hub.wait = false
                        callbackNames.forEach ( cbName => {
                                                        const 
                                                              fn = fnCallbacks[cbName]
                                                            , transformerKey = `${fsmName}/${cbName}`
                                                            , transformFn = hub.transformers [ transformerKey ]
                                                            ;  
                                                        if ( typeof transformFn == 'function' )   data = transformFn (state, response )
                                                        else                                      data = response
                                                        if ( typeof fn == 'function' )   fn(data)
                                                        else                             hub._debugger ( msg.MISSING_FN, cbName )
                                                })
                    })
        } // if fnCallback
}} // _callback func.



module.exports = _callback


