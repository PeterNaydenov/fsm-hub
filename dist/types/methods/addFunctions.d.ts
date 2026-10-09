/**
 * Bind callback registration to a hub.
 * @param {import('../main.js').HubContext} hub - Hub instance and callback registry.
 * @param {import('../msg.js').HubMessages} msg - Diagnostic message templates.
 * @returns {(ins: Record<string, import('../main.js').ListenerCallback>) => void} Bound registration method.
 */
declare function addFunctions(hub: import('../main.js').HubContext, msg: import('../msg.js').HubMessages): (ins: Record<string, import('../main.js').ListenerCallback>) => void;
export default addFunctions;
