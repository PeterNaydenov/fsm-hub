/**
 * Bind diagnostic logging to a hub's debug flag.
 * @private
 * @param {import('../main.js').HubContext} hub - Hub whose debug flag controls logging.
 * @returns {(str: string, data?: any) => void} Bound diagnostic logger.
 */
function  _debugger ( hub ) {
/**
 * Pass a diagnostic template and its value to `console.log` when debugging is enabled.
 * @private
 * @param {string} str - Diagnostic text, optionally containing a `%s` placeholder.
 * @param {*} [data] - Value passed as the second argument to `console.log`.
 * @returns {void}
 */
return function ( str, data ) {
    if ( hub.debug )   console.log ( str, data )
}} // debugger func.



export default _debugger


