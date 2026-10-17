/**
 * Create the warning logger of a hub.
 * @private
 * @param {import('../main.js').HubContext} hub - Hub whose debug flag turns logging on.
 * @returns {(str: string, data?: any) => void} Warning logger.
 */
declare function _debugger(hub: import('../main.js').HubContext): (str: string, data?: any) => void;
export default _debugger;
