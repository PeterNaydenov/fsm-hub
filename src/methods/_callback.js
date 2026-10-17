/**
 * Bind reaction dispatch to a hub.
 * @private
 * @param {import('../main.js').HubContext} hub - Hub with compiled tables and registered listeners.
 * @param {import('../msg.js').HubMessages} msg - Diagnostic message templates.
 * @returns {(task: import('ask-for-promise').AskObject, fsmName: string, state: string, response?: any) => void} Bound reaction dispatcher.
 */
function _callback ( hub, msg ) {

/**
 * Listener input: the configured transformer's output or the original response.
 * @private
 * @param {string} transformerKey - `source/listener` key.
 * @param {string} state - Source FSM's state after its update.
 * @param {*} response - Source FSM's update response.
 * @returns {*} Listener input.
 */
function getData ( transformerKey, state, response ) {
            const transformFn = hub.transformers [ transformerKey ];
            return ( typeof transformFn == 'function' ) ? transformFn ( state, response ) : response
    } // getData func.

/**
 * Report a listener error. Errors are always logged, with or without debug mode.
 * @private
 * @param {string} name - Listener name.
 * @param {*} error - Thrown error or rejection reason.
 * @returns {void}
 */
function fail ( name, error ) {
            console.error ( msg.LISTENER_ERROR, name, error )
    } // fail func.

/**
 * Start subscribed FSM actions, then invoke callback functions in rule order.
 * Each listener receives its configured transformer's output or the original
 * response. Falsy FSM input is replaced with `{ ___internalFlag: true }`;
 * callbacks receive falsy input unchanged. A callback's `answer` is cleared if
 * it contains that internal marker, which can mutate the supplied data object.
 * Missing listeners are skipped with a diagnostic.
 *
 * Complete the task after subscriber update promises settle and callbacks have
 * been invoked. Callback return values and promises are ignored. With no
 * listeners, complete immediately. A thrown transformer or listener, or a rejected
 * subscriber promise, is logged with `console.error`; the other listeners still
 * run and the task still completes.
 * @private
 * @param {import('ask-for-promise').AskObject} task - Reaction task completed through `done()`.
 * @param {string} fsmName - Registered source FSM name.
 * @param {string} state - Source FSM's state after its update.
 * @param {*} [response] - Source FSM's update response.
 * @returns {void}
 */
return function _callback ( task, fsmName, state, response ) {
    const 
          itemKey        = `${fsmName}/${state}`
        , fsmSubscriber  = hub.subscribers[itemKey] || false   // names of subscribed FSM list  
        , callbackNames  = hub.callbacks[itemKey]   || false   // names of subscribed functions list
        , fnCallbacks    = hub.fnCallbacks   // List of available functions       
        , act = hub.actions     // Collection of action names
        , wait = []             // List of promises
        ;
    
    if ( !fsmSubscriber && !callbackNames ) {  // Finish with callback if no subscribed FSM or callback functions
            task.done ()
            return
        }

    if ( fsmSubscriber ) {   // Execute fsm rules
            fsmSubscriber.forEach ( subscriberName => {
                                  if ( !hub.fsm[ subscriberName ] ) {
                                          // Log the missing subscriber's name, not the
                                          // whole subscribers array. The debugger formats
                                          // the warning as `Warning: Fsm "%s" is not
                                          // registered to the hub.` and the array makes
                                          // the message look like
                                          //   `... to the hub. [ 'two' ]`
                                          // instead of the intended
                                          //   `... to the hub. two`
                                          hub._debugger ( msg.MISSING_FSM, subscriberName )
                                          return
                                      }
                                  const action = act [ `${itemKey}/${subscriberName}` ];
                                  try {
                                          let data = getData ( `${fsmName}/${subscriberName}`, state, response );
                                          if ( !data ) {  
                                                    data = {}
                                                    data.___internalFlag = true    
                                                }
                                          hub.updating.add ( subscriberName )   // Its update events are internal for this reaction
                                          const updatePromise = Promise.resolve ( hub.fsm [ subscriberName ].update ( action, data ) );
                                          wait.push ( updatePromise.catch ( error => fail ( subscriberName, error ) ) )
                                      }
                                  catch ( error ) {
                                          fail ( subscriberName, error )
                                      }
                        })           
        } // if fsmSubscriber
        
    if ( callbackNames ) {   // Execute functions rules
              callbackNames.forEach ( cbName => {
                                  const fn = fnCallbacks[cbName];
                                  if ( typeof fn != 'function' ) {
                                          hub._debugger ( msg.MISSING_FN, cbName )
                                          return
                                      }
                                  try {
                                          const data = getData ( `${fsmName}/${cbName}`, state, response );
                                          // `data` can be null/undefined if the response is
                                          // null and no transformer is set, or if the
                                          // transformer itself returns null. Guard the
                                          // `.answer` access so we don't blow up — the
                                          // placeholder-clear below is a no-op when
                                          // `data` is falsy, and `fn(data)` will still
                                          // receive whatever value the user/transformer
                                          // produced (null included).
                                          if ( data && data.answer && Object.hasOwn ( data.answer, '___internalFlag' ) )  data.answer = undefined
                                          fn ( data )
                                      }
                                  catch ( error ) {
                                          fail ( cbName, error )
                                      }
                        })
        } // if fnCallback
    Promise.all ( wait ).then ( () =>  task.done ()   )
}} // _callback func.



export default _callback


