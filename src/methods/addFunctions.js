/**
 * Bind callback registration to a hub.
 * @param {import('../main.js').HubContext} hub - Hub instance and callback registry.
 * @param {import('../msg.js').HubMessages} msg - Diagnostic message templates.
 * @returns {(ins: Record<string, import('../main.js').ListenerCallback>) => void} Bound registration method.
 */
function addFunctions ( hub, msg ) {
/**
 * Register named functions referenced by three-element reactivity rules.
 * Existing names are skipped and reported through the hub debugger. Registering
 * a function does not create a reactivity rule for it.
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


