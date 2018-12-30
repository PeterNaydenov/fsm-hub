const Fsm = require ( '@peter.naydenov/fsm' );

const   // Error and warnings messages
    WRONG_REACTIVITY_RECORD  = 'Error: Wrong reactivity record on row %s.'
  , REGISTERED_FSM_NAME      = 'Warning: FSM "%s" is already registered.'
  , REGISTERED_FUNCTION_NAME = 'Warning: Function "%s" is already registered.'
  , MISSING_FSM              = 'Warning: Fsm "%s" is not registered to the hub.'
  , MISSING_FN               = 'Warning: Function "%s" is not registered to the hub.'
  ;



class FsmHub {

constructor ( machine, transformerLib ) {
        const hub = this;
        hub.fsm = {}          // Fsm's placeholder
        hub.fnCallbacks = {}   // Callback functions place
        hub.debug = machine.debug || false

        const result = this._setTransitions ( machine, transformerLib );
        hub.transformers  = result.transformers  // Data transformation function with format 'fsm/fsmListener' or 'fsm/function'
        hub.subscribers   = result.subscribers   // List of fsm names that are listening for 'fsm/state' changes
        hub.actions       = result.actions       // Fsm action that should be applied on 'fsm/state/listener' 
        hub.callbacks     = result.callbacks     // List of functional callbacks
    } // constructor func.





_setTransitions ( {reactivity, transformers}, transformerLib={} ) {
        let 
              mod = {}
            , subscribers = {}
            , actions     = {}
            , callbacks  = {}
            ;

        reactivity.forEach ( (ruleLine,i) => {
                    const  hub = this;
                    const // ruleLine elements:
                            fsmName = 0
                          , onState = 1
                          , listener = 2
                          , listenerAct = 3
                          , isArray = ruleLine instanceof Array
                          ;

                    if ( !isArray ) {
                            hub._debuger ( WRONG_REACTIVITY_RECORD, i+1 )
                            return
                        }

                    const 
                            length = ruleLine.length
                          , hasCorrectLength = (length == 4 || length == 3 ) ? true : false
                          ;

                    if ( !hasCorrectLength ) {
                            hub._debuger ( WRONG_REACTIVITY_RECORD, i+1 )
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
                            if ( fn )   mod[key] = fn
                        })
            }
        return { transformers: mod, subscribers, callbacks, actions }
    } // _setTransitions func.





addFsm ( ins ) {
        const hub = this;
        Object.keys(ins).forEach ( name => {
                    if ( hub.fsm[name] ) {
                                    hub._debuger ( REGISTERED_FSM_NAME, name )
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
                    if ( hub.fnCallbacks[name] ) {
                                    hub._debuger ( REGISTERED_FUNCTION_NAME, name )
                                    return
                            }
                    hub.fnCallbacks [name] = ins[name]
            })
    } // addFunctions func.





_debuger ( str, data ) {
    const hub = this;
    if ( hub.debug )   console.log ( str, data )
} // debuger func.




_callback ( fsmName, state, response ) {
        const 
              hub = this
            , itemKey        = `${fsmName}/${state}`
            , fsmSubscriber  = hub.subscribers[itemKey] || false
            , callbackNames  = hub.callbacks[itemKey]   || false
            , fnCallbacks    = hub.fnCallbacks          
            , act = hub.actions
            ;
        let data;
        if ( fsmSubscriber ) {
                    fsmSubscriber.forEach ( subscriberName => {
                                if ( !hub.fsm[ subscriberName ] )   {
                                        hub._debuger ( MISSING_FSM, fsmSubscriber )
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
                                hub.fsm [ subscriberName ].update ( action, data )
                        })
            } // if fsmSubscriber
        if ( callbackNames ) {
                    callbackNames.forEach ( cbName => {
                                const 
                                      fn = fnCallbacks[cbName]
                                    , transformerKey = `${fsmName}/${cbName}`
                                    , transformFn = hub.transformers [ transformerKey ]
                                    ;
                                if ( typeof transformFn == 'function' )   data = transformFn (state, response )
                                else                                      data = response
                                if ( typeof fn == 'function' )   fn(data)
                                else                             hub._debuger ( MISSING_FN, cbName )
                        })
            } // if fnCallback
    } // _callback func.

} // FsmHub class



module.exports = FsmHub


