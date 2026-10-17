import askForPromise from "ask-for-promise"

/**
 * Bind reaction scheduling to a hub.
 * @private
 * @param {import('../main.js').HubContext} hub - Hub instance and reaction queues.
 * @returns {(name: string, state: string, response?: any) => void} Bound scheduler.
 */
function _schedule ( hub ) {

/**
 * Start a reaction for a source FSM's update.
 * @private
 * @param {string} name - Registered source FSM name.
 * @param {string} state - Source FSM's state after the update.
 * @param {*} response - Source FSM's update response.
 * @returns {void}
 */
function run ( name, state, response ) {
            const task = askForPromise ();
            hub.lock = true
            hub.updating.clear ()
            task.onComplete ( () => next () )
            hub._callback ( task, name, state, response )
    } // run func.

/**
 * Release the lock and start the next queued update. Internal updates go first.
 * @private
 * @returns {void}
 */
function next () {
            hub.lock = false
            const queue = !hub.cacheInternal.isEmpty () ? hub.cacheInternal
                        : !hub.cache.isEmpty ()         ? hub.cache
                        : null
                        ;
            if ( queue )   run ( ...queue.pull () )
    } // next func.

/**
 * Run one reaction at a time. While a reaction is running, an update from an
 * FSM that this reaction is updating is internal: it waits in the internal
 * FIFO queue. Every other update waits in the external FIFO queue.
 * @private
 * @param {string} name - Registered source FSM name.
 * @param {string} state - Source FSM's state after the update.
 * @param {*} [response] - Source FSM's update response.
 * @returns {void}
 */
return function _schedule ( name, state, response ) {
            if ( !hub.lock ) {
                    run ( name, state, response )
                    return
                }
            const queue = hub.updating.has ( name ) ? hub.cacheInternal : hub.cache;
            queue.push ( [[ name, state, response ]])
}} // _schedule func.



export default _schedule


