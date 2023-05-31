import methods from './methods/index.js'
import msg from './msg.js'
import askForPromise from 'ask-for-promise'
import stack from '@peter.naydenov/stack'

function FsmHub ( machine, transformerLib ) {
   const 
          hub = this
        , fnKeys = Object.keys ( methods )
        ;
        hub.fsm = {}                        // Fsm's placeholder
        hub.fnCallbacks = {}                // Callback functions place
        hub.debug = machine.debug || false
        hub.cache = stack ({ type : 'FIFO' })
        hub.cacheInternal = stack ({ type: 'FIFO' })
        hub.wait = []
        hub.lock = false
        hub.haveInternalRequest = false
        hub.reactivityTask = false
        hub.askForPromise = askForPromise

        fnKeys.forEach ( k => {   // Attach methods to fsmHub
                  hub[k] = methods[k]( hub, msg )   
            })   

        const { transformers, subscribers, actions, callbacks } = hub._setTransitions ( machine, transformerLib );
        hub.transformers = transformers  // Data transformation function with format 'fsm/fsmListener' or 'fsm/function'
        hub.subscribers  = subscribers   // List of fsm names that are listening for 'fsm/state' changes
        hub.actions      = actions       // Fsm action that should be applied on 'fsm/state/listener' 
        hub.callbacks    = callbacks     // List of functional callbacks
} // FsmHub class



export default FsmHub


