const Fsm = require ( '@peter.naydenov/fsm' );




class FsmHub {

constructor ( machine, transitionLib ) {
        const hub = this;

        hub.fsm = {}
        const result = this._setTransitions ( machine, transitionLib )
        hub.transition  = result.transitions
        hub.subscribers = result.subscribers
        hub.actions     = result.actions
    } // constructor func.





_setTransitions ( {table, transformers}, transitionLib ) {
    let 
          transitions = {}
        , subscribers = {}
        , actions    = {}
        ;

    table.forEach ( (el,i) => {
            if ( !(el instanceof Array) &&   el.length != 4  ) {
                    console.log ( `Error: Wrong description record on row ${i+1}.`)
                    return
               }
            const key = `${el[0]}/${el[1]}`;     // fsmName/state
            subscribers [key] = el[2]
            actions [`${key}/${el[2]}`] = el[3]  // fsmName/state/fsmSubscriberName
       })
    if ( transitionLib )   transitions = Object.assign ( {}, transitionLib )

    return { transitions, subscribers, actions }
} // _setTransitions func.





addFsm ( name, fsm ) {
        const hub = this;
        if ( hub[name] ) {
                console.log ( `FSM "${name}" is already registered` )
                return
        }
        hub [ name ] = fsm
        fsm.on ( 'update', (state, response) =>  hub._callback (name, state, response)   )
    } // addFsm func.





_callback ( source, state, response ) {
    const 
          hub = this
        , subscribers = hub.subscribers
        , act = hub.actions
        , item = `${source}/${state}`
        , fsmSubscriber = subscribers[item]
        ;
    let data;
    if ( fsmSubscriber ) {
            // TODO: check for transformations
            data = response
            if ( !fsm [ fsmSubscriber ] )   {
                    console.log ( `Warning: Fsm "${fsmSubscriber}" is not registered to the hub.` )
                    return
               }
            action = act [ `${item}/${fsmSubscriber}`]
            fsm [ fsmSubscriber ].update ( action, data )
       } // if fsmSubscriber
} // _callback func.

} // FsmHub class



module.exports = FsmHub


