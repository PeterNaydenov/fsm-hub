const
  FsmHub  = require ('../src/index.js')
, Fsm     = require ( '@peter.naydenov/fsm')
, chai    = require ( 'chai' )
, expect  = require ( 'expect.js')
;

describe ( 'Finite State Machine', () => {



it ( 'Check FSM structure', () => {
// Define Fsm machines
    const 
         miniOne = {
                          init : 'none'
                        , table : [
                                    [ 'none', 'activate', 'active', 'switchOn']
                                ]
                };

// Setup fsm transition libraries
    const transitionOne = {
                    switchOn ( task, dependencies, stateObj, dt ) {
                                task.done ({ 
                                          success  : true 
                                        , response : dt
                                    })
                        }
            };



// Init fsm machines
    const  // oneFsm and twoFsm are identical
          oneFsm = new Fsm ( miniOne, transitionOne  )
        , twoFsm = new Fsm ( miniOne, transitionOne  )
        ;




// Define hub
const 
        machine = {
                        reactivity : [
                                    //    [ fsm, onStateChange, listenerFsm , action  ]
                                          [ 'oneFsm', 'active', 'twoFsm', 'activate'  ]
                                    //    [ 'fsm',     'state', 'callbackFn' ]
                                        , [ 'twoFsm', 'active', 'showme' ]
                                    ]
                        , transformers : {
                                        // "from/to" : functionName
                                        'twoFsm/showme' : 'simple'
                                    }       
                    }
      , transformerLib = {
                        simple : function ( state, resultResponseData ) {
                                        return {
                                                  second : 'second'
                                                , state
                                                , 'answer' : resultResponseData
                                            }
                                    } 
                    }
      ;

// Initialize the hub
    let hub = new FsmHub ( machine, transformerLib );

    function showme (transitionResult) {
        console.log ( 'ShowMe' )
        console.log (transitionResult)
    } // showme func.

    hub.addFsm ({ oneFsm, twoFsm })
    hub.addFunctions ( { showme  })

// Start!
    oneFsm.update ( 'activate', 'try' )
}) // it minimal working configuration



}) // describe


