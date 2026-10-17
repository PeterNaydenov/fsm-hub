/**
 * Create the warning logger of a hub.
 * @private
 * @param {import('../main.js').HubContext} hub - Hub whose debug flag turns logging on.
 * @returns {(str: string, data?: any) => void} Warning logger.
 */
function  _debugger ( hub ) {
/**
 * Log a message template and its value with `console.log`, in debug mode only.
 * @private
 * @param {string} str - Diagnostic text, optionally containing a `%s` placeholder.
 * @param {*} [data] - Value passed as the second argument to `console.log`.
 * @returns {void}
 */
return function ( str, data ) {
    if ( hub.debug )   console.log ( str, data )
}} // _debugger func.



export default _debugger


