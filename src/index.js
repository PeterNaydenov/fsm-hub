const Fsm = require ( '@peter.naydenov/fsm' );



class FsmHub {

constructor ( machine, transformerLib ) {
        const hub = this;
        hub.fsm = {}          // Fsm's placeholder
        hub.fnCallback = {}   // Callback functions place

        const result = this._setTransitions ( machine, transformerLib );
        hub.transition  = result.transitions   // Data transformation function with format 'fsm/fsmListener' or 'fsm/function'
        hub.subscribers = result.subscribers   // List of fsm names that are listening for 'fsm/state' changes
        hub.actions     = result.actions       // Fsm action that should be applied on 'fsm/state/listener' 
        hub.callbacks  = result.callbacks      // List of functional callbacks
    } // constructor func.





_setTransitions ( {table, transformers}, transformerLib={} ) {
        let 
              transitions = {}
            , subscribers = {}
            , actions     = {}
            , callbacks  = {}
            ;

        table.forEach ( (ruleLine,i) => {
                    const // ruleLine elements:
                            fsmName = 0
                          , onState = 1
                          , listener = 2
                          , listenerAct = 3
                          , isArray = ruleLine instanceof Array
                          ;

                    if ( !isArray ) {
                            console.log ( `Error: Wrong description record on row ${i+1}.`)
                            return
                        }

                    const 
                            length = ruleLine.length
                          , hasCorrectLength = (length == 4 || length == 3 ) ? true : false
                          ;

                    if ( !hasCorrectLength ) {
                            console.log ( `Error: Wrong description record on row ${i+1}.`)
                            return
                        }

                    const key = `${ruleLine[fsmName]}/${ruleLine[onState]}`;   // fsmName/state
                    if ( length == 4 ) { // ruleLine with fsm
                            if ( !subscribers[key] )   subscribers[key] = []
                            subscribers [key].push ( ruleLine[listener]   ) 

                            const actKey = `${key}/${ruleLine[listener]}`;   // fsmName/state/fsmSubscriberName
                            actions [actKey] = ruleLine[listenerAct]
                        }

                    if ( length == 3 ) {   // ruleLine with function callback
                            if ( !callbacks[key] )   callbacks[key] = []
                            callbacks[key].push ( ruleLine[listener] )
                        }
            }) // forEach ruleLine
        if ( transformers )   {
                    Object.keys ( transformers ).forEach ( key => {
                            const
                                  keyFn = transformers [key]
                                , fn    = transformerLib [ keyFn] 
                                ;
                            if ( fn )   transitions[key] = fn
                        })
            }
        return { transitions, subscribers, callbacks, actions }
    } // _setTransitions func.





addFsm ( ins ) {
        const hub = this;
        Object.keys(ins).forEach ( name => {
                    if ( hub.fsm[name] ) {
                                    console.log ( `FSM "${name}" is already registered` )
                                    return
                            }
                    hub.fsm [name] = ins[name]
                    hub.fsm [name].on ( 'update', (state, response ) => {
                                hub._callback ( name, state, response )
                        })
            })
    } // addFsm func.





addFunctions ( ins ) {
        const hub = this;
        Object.keys(ins).forEach ( name => {
                    if ( hub.fnCallback[name] ) {
                                    console.log ( `Function "${name}" is already registered` )
                                    return
                            }
                    hub.fnCallback [name] = ins[name]
            })
    } // addFunctions func.





_callback ( fsmName, state, response ) {
        const 
              hub = this
            , itemKey       = `${fsmName}/${state}`
            , fsmSubscriber = hub.subscribers[itemKey] || false
            , callbackNames      = hub.callbacks[itemKey]   || false
            , fnCallback    = hub.fnCallback  || false
            , act = hub.actions
            ;
        let data;
        if ( fsmSubscriber ) {
                    fsmSubscriber.forEach ( subscriberName => {
                                if ( !hub.fsm[ subscriberName ] )   {
                                        console.log ( `Warning: Fsm "${fsmSubscriber}" is not registered to the hub.` )
                                        return
                                    }
                                const 
                                      actionKey = `${itemKey}/${subscriberName}`
                                    , action = act [actionKey]
                                    , transformerKey = `${fsmName}/${subscriberName}`
                                    , transformFn = hub.transition [transformerKey]
                                    ;
                                if ( typeof transformFn == 'function' )   data = transformFn (state, response )
                                else                                      data = response
                                hub.fsm [ subscriberName ].update ( action, data )
                        })
            } // if fsmSubscriber
        if ( callbackNames ) {
                    callbackNames.forEach ( cbName => {
                                const fn = fnCallback[cbName];
                                if ( typeof fn == 'function' )   fn(data)
                        })
            } // if fnCallback
    } // _callback func.

} // FsmHub class



module.exports = FsmHub


