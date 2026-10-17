/**
 * Create the reaction dispatcher of a hub.
 * @private
 * @param {import('../main.js').HubContext} hub - Hub with compiled tables and registered listeners.
 * @param {import('../msg.js').HubMessages} msg - Message templates.
 * @returns {(task: import('ask-for-promise').AskObject, fsmName: string, state: string, response?: any) => void} Bound reaction dispatcher.
 */
declare function _callback(hub: import('../main.js').HubContext, msg: import('../msg.js').HubMessages): (task: import('ask-for-promise').AskObject, fsmName: string, state: string, response?: any) => void;
export default _callback;
