/**
 * Create the reaction dispatcher of a hub.
 * @private
 * @param {import('../main.js').HubContext} hub - Hub with compiled tables and registered listeners.
 * @param {import('../msg.js').HubMessages} msg - Message templates.
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
 * Log a listener error with `console.error`, also without debug mode.
 * @private
 * @param {string} name - Listener name.
 * @param {*} error - Thrown error or rejection reason.
 * @returns {void}
 */
function fail ( name, error ) {
            console.error ( msg.LISTENER_ERROR, name, error )
    } // fail func.

/**
 * Run the reaction to one update: start the actions of subscriber FSMs, then
 * call the callback functions, each in rule order. Each listener gets its
 * transformer's result, or the response unchanged (falsy values included).
 * Repeated rules for one subscriber send their own actions. Each subscriber is
 * added to `hub.updating`, so its update events count as internal. Missing
 * listeners are skipped with a warning.
 *
 * The task completes when all subscriber updates have settled and all callbacks
 * have been called; with no listeners, at once. Callback results are ignored.
 * A thrown transformer or listener, or a rejected subscriber update, is logged
 * with `console.error`; the other listeners still run and the task completes.
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
        , ruleIndex      = {}   // Rules seen so far for each subscriber name
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
                                  const 
                                          i = ruleIndex[subscriberName] = ( ruleIndex[subscriberName] ?? -1 ) + 1
                                        , action = act [ `${itemKey}/${subscriberName}` ][i]
                                        ;
                                  try {
                                          const data = getData ( `${fsmName}/${subscriberName}`, state, response );
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
                                          fn ( getData ( `${fsmName}/${cbName}`, state, response ) )
                                      }
                                  catch ( error ) {
                                          fail ( cbName, error )
                                      }
                        })
        } // if fnCallback
    Promise.all ( wait ).then ( () =>  task.done ()   )
}} // _callback func.



export default _callback


