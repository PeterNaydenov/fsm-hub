/**
 * Bind FSM registration to a hub.
 * @param {import('../main.js').HubContext} hub - Hub instance and reaction queues.
 * @param {import('../msg.js').HubMessages} msg - Diagnostic message templates.
 * @returns {(ins: Record<string, import('../main.js').RegisteredFsm>) => void} Bound registration method.
 */
declare function addFsm(hub: import('../main.js').HubContext, msg: import('../msg.js').HubMessages): (ins: Record<string, import('../main.js').RegisteredFsm>) => void;
export default addFsm;
