const
  FsmHub  = require ('../src/index.js')
, Fsm     = require ( '@peter.naydenov/fsm')
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
                                return { 
                                          state
                                        , 'answer' : resultResponseData 
                                    }
                            }
                    }
        ,  machine = {
                       table : [
                                   // [ fsm, onStateChange, listenerFsm , action  ]
                                      [ 'oneFsm', 'active', 'twoFsm', 'activate'  ]
                                    , [ 'miniOne', 'off',    'miniTwo', 'switchOFF' ]
                                    , [ 'miniTwo', 'off',    'miniOne', 'switchOFF' ]
                                    //[ 'fsm',     'state', 'callbackFn' ]
                                    , [ 'oneFsm', 'active', 'yo'        ]
                                ]
                      , transformers : {
                                      // "from/to" : functionName
                                     'oneFsm/twoFsm' : 'one2two' 
                                  }       
                 }
        , miniOne = {
                          init : 'none'
                        , table : [
                                    [ 'none', 'activate', 'active', 'switchOn']
                                ]
                }
        , miniTwo = {
                          init : 'none'
                        , table : [
                                    ['none', 'activate', 'active', 'switchOn' ]
                                ]
                }
        ;

    function switchOn ( task, dependencies, stateObj, dt ) {
            console.log ( dt )
            task.done ({ 
                      success  : true 
                    , response : 'hello'
                })
        }

    const 
          oneFsm = new Fsm ( miniOne, { switchOn}  )
        , twoFsm = new Fsm ( miniTwo, { switchOn}  )
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

    hub.addFsm ({ oneFsm, twoFsm })

    console.log ( hub )
    oneFsm.update ( 'activate', 'try' )
}) // it minimal working configuration



}) // describe


