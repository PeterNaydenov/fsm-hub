/**
 * Bind reaction scheduling to a hub.
 * @private
 * @param {import('../main.js').HubContext} hub - Hub instance and reaction queues.
 * @returns {(name: string, state: string, response?: any) => void} Bound scheduler.
 */
declare function _schedule(hub: import('../main.js').HubContext): (name: string, state: string, response?: any) => void;
export default _schedule;
