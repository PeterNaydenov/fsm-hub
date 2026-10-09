/**
 * Bind compilation of reactivity rules to a hub.
 * @private
 * @param {import('../main.js').HubContext} hub - Hub used to report invalid rules.
 * @param {import('../msg.js').HubMessages} msg - Diagnostic message templates.
 * @returns {(machine: import('../main.js').HubDescription, transformerLib?: import('../main.js').TransformerLibrary) => import('../main.js').ReactionTables} Bound table compiler.
 */
function _setTransitions ( hub, msg ) {
/**
 * Compile three-element callback rules and four-element FSM rules into lookup tables.
 * Non-array rows and rows of other lengths are skipped with a diagnostic using
 * their one-based row number. Listener lists retain rule order and duplicates;
 * the last action wins for a repeated `source/state/subscriber` key. Transformer
 * names absent from the supplied library are omitted.
 * @private
 * @param {import('../main.js').HubDescription} machine - Reactivity and transformer configuration.
 * @param {import('../main.js').TransformerLibrary} [transformerLib={}] - Functions by name.
 * @returns {import('../main.js').ReactionTables} Compiled listener, action, and transformer tables.
 */
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


