/**
 * Create the `addFunctions` method of a hub.
 * @param {import('../main.js').HubContext} hub - Hub that receives the callbacks.
 * @param {import('../msg.js').HubMessages} msg - Message templates.
 * @returns {(ins: Record<string, import('../main.js').ListenerCallback>) => void} `addFunctions` method.
 */
declare function addFunctions(hub: import('../main.js').HubContext, msg: import('../msg.js').HubMessages): (ins: Record<string, import('../main.js').ListenerCallback>) => void;
export default addFunctions;
