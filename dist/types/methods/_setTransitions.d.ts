/**
 * Bind compilation of reactivity rules to a hub.
 * @private
 * @param {import('../main.js').HubContext} hub - Hub used to report invalid rules.
 * @param {import('../msg.js').HubMessages} msg - Diagnostic message templates.
 * @returns {(machine: import('../main.js').HubDescription, transformerLib?: import('../main.js').TransformerLibrary) => import('../main.js').ReactionTables} Bound table compiler.
 */
declare function _setTransitions(hub: import('../main.js').HubContext, msg: import('../msg.js').HubMessages): (machine: import('../main.js').HubDescription, transformerLib?: import('../main.js').TransformerLibrary) => import('../main.js').ReactionTables;
export default _setTransitions;
