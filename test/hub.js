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
                        , simple : function ( state, resultResponseData ) {
                                console.log ( 'hello from second transformation' )
                                return {
                                            second : 'second'
                                          , state
                                          , 'answer' : resultResponseData
                                        }
                            } 
                    }
        ,  machine = {
                       reactivity : [
                                   // [ fsm, onStateChange, listenerFsm , action  ]
                                      [ 'oneFsm', 'active', 'twoFsm', 'activate'  ]
                                    , [ 'miniOne', 'off',    'miniTwo', 'switchOFF' ]
                                    , [ 'miniTwo', 'off',    'miniOne', 'switchOFF' ]
                                    //[ 'fsm',     'state', 'callbackFn' ]
                                    , [ 'oneFsm', 'active', 'yo'        ]
                                    , [ 'twoFsm', 'active', 'showme']
                                ]
                      , transformers : {
                                      // "from/to" : functionName
                                       'oneFsm/twoFsm' : 'one2two'
                                     , 'twoFsm/showme' : 'simple' 
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
            task.done ({ 
                      success  : true 
                    , response : dt
                })
        }

    function switchOnSecond ( task, dependencies, stateObj, dt ) {
            task.done ({ 
                      success  : true 
                    , response : dt
                })
        }

    const 
          oneFsm = new Fsm ( miniOne, { switchOn}  )
        , twoFsm = new Fsm ( miniTwo, { switchOn: switchOnSecond}  )
        ;

    let hub = new FsmHub ( machine, transformerLib );

    hub.addFsm ({ oneFsm, twoFsm })

    hub.addFunctions ( {
          'yo'     : transitionResult => {
                            console.log ( 'YO' )
                            console.log (transitionResult)
                        }
        , 'showme' : transitionResult => {
                            console.log ( 'ShowMe' )
                            console.log (transitionResult)
                        }
    })

    // console.log ( hub )
    oneFsm.update ( 'activate', 'try' )

       

}) // it minimal working configuration



}) // describe


