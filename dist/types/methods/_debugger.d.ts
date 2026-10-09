/**
 * Bind diagnostic logging to a hub's debug flag.
 * @private
 * @param {import('../main.js').HubContext} hub - Hub whose debug flag controls logging.
 * @returns {(str: string, data?: any) => void} Bound diagnostic logger.
 */
declare function _debugger(hub: import('../main.js').HubContext): (str: string, data?: any) => void;
export default _debugger;
