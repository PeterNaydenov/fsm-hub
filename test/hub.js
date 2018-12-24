const
  FsmHub  = require ('../src/index.js') 
, chai    = require ( 'chai' )
, expect  = require ( 'expect.js')
;

describe ( 'Finite State Machine', () => {



it ( 'Check FSM structure', () => {
   // SETUP - provide machine description and transition library.
    const 
           transformerLib = {
                        "one2two" : function ( state, resultResponseData ) {
                                // convert values from miniOne to miniTwo format
                                return resultResponseData
                            }
                    }
        ,  machine = {
                       table : [
                                   // [ fsm, onStateChange, listenerFsm , action  ]
                                      [ 'miniOne', 'active', 'miniTwo', 'activate'  ]
                                    , [ 'miniOne', 'off',    'miniTwo', 'switchOFF' ]
                                    , [ 'miniTwo', 'off',    'miniOne', 'switchOFF' ]
                                ]
                      , transformers : {
                                      // "from/to" : functionName
                                     'miniOne/miniTwo' : 'one2two' 
                                  }       
                 }
        , miniOne = {
                          init : 'none'
                        , table : [
                                    [ 'none', '']
                                ]
                }
        , miniTwo = {
                          init : 'none'
                        , table : [

                                ]
                }
        ;

   



    // HOW IT SHOULD WORK?

    /**
     *    
     *  *** FSM orchestration and state managment tool
     *   - Register fsm
     *   - Create and register fsm
     *   - Register for fsm changes
     *   - Library with listener functions
     *   - listener function arguments ( state, responseData )
     *   - listener function response - void
     *   - Internal callback function
     *       Started on "update" event with params from the table
     *   - description table:
     *     [ source, onStateChange, listenerFsm , action  ]
     *     fsm - listened fsm
     *     onStateChange - read state after "update" event
     *     listenerFsm  - Other fsm that should react on change
     *     action - update reaction from listenerFsm
     *     transformerLib - result.response in different FSM could vary. 
     *        TransformerLib functions will take care to make data compatible 
     *        across the hub. TransformerLib should be optional. Only if you need
     *        it.
     *     transformerFunction - apply to result.response data before apply 
     *     the listenerFSM "update"
     * 
     */

    let hub = new FsmHub ( machine, transformerLib );

    console.log ( hub )
    
   
}) // it minimal working configuration



}) // describe


