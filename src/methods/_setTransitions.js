/**
 * Create the rule compiler of a hub.
 * @private
 * @param {import('../main.js').HubContext} hub - Hub that reports wrong rules.
 * @param {import('../msg.js').HubMessages} msg - Message templates.
 * @returns {(description: import('../main.js').HubDescription, transformerLib?: import('../main.js').TransformerLibrary | null) => import('../main.js').ReactionTables} Bound table compiler.
 */
function _setTransitions ( hub, msg ) {
/**
 * Compile the reactivity rules and transformer names into lookup tables.
 * Three-element rules go to `callbacks`, four-element rules to `subscribers`
 * and `actions`. A rule that is not an array of 3 or 4 elements is skipped with
 * a warning that has its row number, from 1. Lists keep rule order and repeated
 * names; `actions` has one action per rule. Transformer names that are not own
 * keys of the library (e.g. `toString`) are skipped.
 * @private
 * @param {import('../main.js').HubDescription} description - Reactivity rules and transformer names.
 * @param {import('../main.js').TransformerLibrary|null} [transformerLib={}] - Functions by name. `null` works like `{}`.
 * @returns {import('../main.js').ReactionTables} Compiled listener, action, and transformer tables.
 */
return function ( {reactivity, transformers}, transformerLib ) {
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
                        if ( !actions[actKey] )   actions[actKey] = []
                        actions [actKey].push ( listenerAct )
                    }

                if ( length == 3 ) {   // ruleLine with function callback
                        if ( !callbacks[key] )   callbacks[key] = []
                        callbacks[key].push ( listener )
                    }
        }) // forEach ruleLine
    transformerLib = transformerLib ?? {}   // Also covers an explicit null
    if ( transformers )   {
                Object.keys ( transformers ).forEach ( key => {
                        const
                              keyFn = transformers [key]
                            , fn    = Object.hasOwn ( transformerLib, keyFn ) ? transformerLib [ keyFn ] : undefined   // Ignore inherited names like 'toString'
                            ;
                        if ( fn )   mod[key] = fn
                    })
        }
    return { transformers: mod, subscribers, callbacks, actions }
}} // _setTransitions func.



export default _setTransitions


