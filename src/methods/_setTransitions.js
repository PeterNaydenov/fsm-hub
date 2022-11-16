function _setTransitions ( hub, msg ) {
return function ( {reactivity, transformers}, transformerLib={} ) {
    let 
          mod = {}
        , subscribers = {}
        , actions     = {}
        , callbacks  = {}
        ;

    reactivity.forEach ( (ruleLine,i) => {
                const isArray = ruleLine instanceof Array;

                if ( !isArray ) {
                        hub._debugger ( msg.WRONG_REACTIVITY_RECORD, i+1 )
                        return
                    }

                const 
                        length = ruleLine.length
                      , [ fsmName, onState, listener, listenerAct ]= ruleLine   // RuleLine elements
                      , hasCorrectLength = (length == 4 || length == 3 ) ? true : false
                      ;

                if ( !hasCorrectLength ) {
                        hub._debugger ( msg.WRONG_REACTIVITY_RECORD, i+1 )
                        return
                    }

                const key = `${fsmName}/${onState}`;   // fsmName/state
                if ( length == 4 ) { // ruleLine with fsm
                        if ( !subscribers[key] )   subscribers[key] = []
                        subscribers [key].push ( listener   ) 

                        const actKey = `${key}/${listener}`;   // fsmName/state/fsmSubscriberName
                        actions [actKey] = listenerAct
                    }

                if ( length == 3 ) {   // ruleLine with function callback
                        if ( !callbacks[key] )   callbacks[key] = []
                        callbacks[key].push ( listener )
                    }
        }) // forEach ruleLine
    if ( transformers )   {
                Object.keys ( transformers ).forEach ( key => {
                        const
                              keyFn = transformers [key]
                            , fn    = transformerLib [ keyFn] 
                            ;
                        if ( fn )   mod[key] = fn
                    })
        }
    return { transformers: mod, subscribers, callbacks, actions }
}} // _setTransitions func.



export default _setTransitions


