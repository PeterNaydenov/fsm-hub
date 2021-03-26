function addFsm ( hub, msg ) {
return function ( ins ) {
            Object.keys(ins).forEach ( name => {
                        if ( hub.fsm[name] ) {
                                        hub._debugger ( msg.REGISTERED_FSM_NAME, name )
                                        return
                                }
                        hub.fsm [name] = ins[name]
                        hub.fsm [name].on ( 'update', (state, response ) =>  hub._callback ( name, state, response )   )
                })
}} // addFsm func.



module.exports = addFsm


