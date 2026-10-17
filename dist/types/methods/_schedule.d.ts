/**
 * Create the reaction scheduler of a hub.
 * @private
 * @param {import('../main.js').HubContext} hub - Hub with the reaction queues.
 * @returns {(name: string, state: string, response?: any) => void} Scheduler.
 */
declare function _schedule(hub: import('../main.js').HubContext): (name: string, state: string, response?: any) => void;
export default _schedule;
