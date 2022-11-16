function addFunctions ( hub, msg ) {
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


