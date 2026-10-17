/**
 * Create the rule compiler of a hub.
 * @private
 * @param {import('../main.js').HubContext} hub - Hub that reports wrong rules.
 * @param {import('../msg.js').HubMessages} msg - Message templates.
 * @returns {(description: import('../main.js').HubDescription, transformerLib?: import('../main.js').TransformerLibrary | null) => import('../main.js').ReactionTables} Bound table compiler.
 */
declare function _setTransitions(hub: import('../main.js').HubContext, msg: import('../msg.js').HubMessages): (description: import('../main.js').HubDescription, transformerLib?: import('../main.js').TransformerLibrary | null) => import('../main.js').ReactionTables;
export default _setTransitions;
