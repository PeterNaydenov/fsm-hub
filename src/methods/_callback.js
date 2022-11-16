import askForPromise from "ask-for-promise"

function _callback ( hub, msg ) {
return function _callback ( task, fsmName, state, response ) {
    const 
          itemKey        = `${fsmName}/${state}`
        , fsmSubscriber  = hub.subscribers[itemKey] || false   // names of subscribed FSM list  
        , callbackNames  = hub.callbacks[itemKey]   || false   // names of subscribed functions list
        , fnCallbacks    = hub.fnCallbacks   // List of available functions       
        , act = hub.actions     // Collection of action names
        , wait = []             // List of promises
        ;
    let data;
    
    if ( !fsmSubscriber && !callbackNames ) {  // Finish with callback if no subscribed FSM or callback functions
            task.done ()
            return
        }

    if ( fsmSubscriber ) {   // Execute fsm rules 
            fsmSubscriber.forEach ( subscriberName => {
                                  if ( !hub.fsm[ subscriberName ] ) {
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
  
                                  if ( !data ) {  
                                            data = {}
                                            data.___internalFlag = true    
                                        }
                                        
                                  const updatePromise = hub.fsm [ subscriberName ].update ( action, data );
                                  wait.push (  updatePromise   )
                        })           
        } // if fsmSubscriber
        
    if ( callbackNames ) {   // Execute functions rules
              let startFunctions = askForPromise ();
              wait.push ( startFunctions.promise  )

              callbackNames.forEach ( cbName => {
                                  const 
                                        fn = fnCallbacks[cbName]
                                      , transformerKey = `${fsmName}/${cbName}`
                                      , transformFn = hub.transformers [ transformerKey ]
                                      ;  
                    
                                  if ( typeof transformFn == 'function' )   data = transformFn (state, response )
                                  else                                      data = response

                                  if ( data.answer && data.answer.hasOwnProperty ( '___internalFlag') )  data.answer = undefined
                                  
                                  if ( typeof fn == 'function' )   fn(data)
                                  else                             hub._debugger ( msg.MISSING_FN, cbName )
                                  
                        })
              startFunctions.done ()
        } // if fnCallback
    Promise.all ( wait ).then ( () =>  task.done ()   )
}} // _callback func.



export default _callback


