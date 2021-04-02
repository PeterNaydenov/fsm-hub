const askForPromise = require("ask-for-promise");

function _callback ( hub, msg ) {
return function _callback ( task, fsmName, state, response ) {
    const 
          itemKey        = `${fsmName}/${state}`
        , fsmSubscriber  = hub.subscribers[itemKey] || false
        , callbackNames  = hub.callbacks[itemKey]   || false
        , fnCallbacks    = hub.fnCallbacks          
        , act = hub.actions
        , wait = []
        ;
    let data;

    if ( !fsmSubscriber && !callbackNames ) {
            task.done ()
            return
        }

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

                                  if ( !data )   data = {}
                                  data.___internalFlag = true
                                  const updatePromise = hub.fsm [ subscriberName ].update ( action, data );
                                  wait.push (  updatePromise   )
                        })           
        } // if fsmSubscriber

    if ( callbackNames ) {
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
                                  if ( typeof fn == 'function' )   fn(data)
                                  else                             hub._debugger ( msg.MISSING_FN, cbName )
                                  
                        })
              startFunctions.done ()
        } // if fnCallback
    Promise.all ( wait ).then ( () =>  task.done ()   )
}} // _callback func.





module.exports = _callback


