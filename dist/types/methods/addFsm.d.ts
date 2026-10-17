/**
 * Create the `addFsm` method of a hub.
 * @param {import('../main.js').HubContext} hub - Hub that receives the FSMs.
 * @param {import('../msg.js').HubMessages} msg - Message templates.
 * @returns {(ins: Record<string, import('../main.js').RegisteredFsm>) => void} `addFsm` method.
 */
declare function addFsm(hub: import('../main.js').HubContext, msg: import('../msg.js').HubMessages): (ins: Record<string, import('../main.js').RegisteredFsm>) => void;
export default addFsm;
