/**
 * Create the `addFunctions` method of a hub.
 * @param {import('../main.js').HubContext} hub - Hub that receives the callbacks.
 * @param {import('../msg.js').HubMessages} msg - Message templates.
 * @returns {(ins: Record<string, import('../main.js').ListenerCallback>) => void} `addFunctions` method.
 */
function addFunctions ( hub, msg ) {
/**
 * Register callback functions by name, for three-element reactivity rules.
 * Registering a function does not create a rule for it. A name that is already
 * registered is skipped, with a warning in debug mode. Values are not checked:
 * a value that is not a function is reported as missing when a rule needs it.
 * @param {Record<string, import('../main.js').ListenerCallback>} ins - Callbacks by name.
 * @returns {void}
 * @example
 * hub.addFunctions({ report: data => console.log(data) });
 */
return function ( ins ) {
    Object.keys(ins).forEach ( name => {
                if ( hub.fnCallbacks[name] ) {
                            hub._debugger ( msg.REGISTERED_FUNCTION_NAME, name )
                            return
                    }
                hub.fnCallbacks [name] = ins[name]
        })
}} // addFunctions func.



export default addFunctions


