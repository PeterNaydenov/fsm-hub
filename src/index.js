const 
      methods  = require ( './methods/index')
    , msg      = require ( './msg'          )
    ;



function FsmHub ( machine, transformerLib ) {
        const 
              hub = this
            , fnKeys = Object.keys ( methods )
            ;
        hub.fsm = {}                        // Fsm's placeholder
        hub.fnCallbacks = {}                // Callback functions place
        hub.debug = machine.debug || false

        fnKeys.forEach ( k => hub[k] = methods[k](hub,msg)   )   // Attach methods to fsmHub

        const { transformers, subscribers, actions, callbacks } = this._setTransitions ( machine, transformerLib );
        hub.transformers = transformers  // Data transformation function with format 'fsm/fsmListener' or 'fsm/function'
        hub.subscribers  = subscribers   // List of fsm names that are listening for 'fsm/state' changes
        hub.actions      = actions       // Fsm action that should be applied on 'fsm/state/listener' 
        hub.callbacks    = callbacks     // List of functional callbacks
} // FsmHub class



module.exports = FsmHub


