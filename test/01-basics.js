import FsmHub from '../src/main.js'
import Fsm from '@peter.naydenov/fsm'
import { expect } from 'chai'

const
    WRONG_REACTIVITY_RECORD  = 'Error: Wrong reactivity record on row %s.'
  , REGISTERED_FSM_NAME      = 'Warning: FSM "%s" is already registered.'
  , REGISTERED_FUNCTION_NAME = 'Warning: Function "%s" is already registered.'
  , MISSING_FSM              = 'Warning: Fsm "%s" is not registered to the hub.'
  , MISSING_FN               = 'Warning: Function "%s" is not registered to the hub.'
  ;

describe ( 'Fsm Hub', () => {


it ( 'Hub structure', () => {
        const 
        hubDetails = {
            reactivity : [
                                [ 'one', 'active', 'two', 'activate' ]
                            ]
            };

        const hub = new FsmHub ( hubDetails )

        expect ( hub ).to.have.property ( 'fsm' )
        expect ( hub ).to.have.property ('fnCallbacks')
        expect ( hub ).to.have.property ( 'transformers' )
        expect ( hub ).to.have.property ( 'subscribers' )
        expect ( hub ).to.have.property ( 'actions' )
        expect ( hub ).to.have.property ( 'callbacks' )

        expect ( hub.subscribers ).to.have.property ( 'one/active' )
        expect ( hub.subscribers['one/active'] ).to.be.an ( 'array' )
        expect ( hub.subscribers['one/active'][0] ).to.be.equal ( 'two' )

        expect ( hub.actions ).to.have.property ( 'one/active/two' )
        expect ( hub.actions['one/active/two']).to.be.equal ( 'activate' )
        
    }) // it hub structure





it ( 'Add a fsm', () => {
        const 
            mini = {
                              init : 'none'
                            , table : [
                                        [ 'none', 'activate', 'active', 'switchOn']
                                    ]
                    };
        const machine = new Fsm ( mini );
        const 
            hubDescription = {
                            reactivity : [
                                              [ 'one', 'active', 'two', 'activate'  ]
                                            , [ 'two', 'active', 'showme' ]
                                        ]
                            , transformers : {
                                            // "from/to" : functionName
                                            'two/showme' : 'simple'
                                        }       
                        }
        const hub = new FsmHub ( hubDescription );
        hub.addFsm ( { one:machine })

        expect ( hub.fsm ).to.have.property ( 'one' )
    }) // register a fsm





it ( 'Add a callback function', () => {
        function showme ( data ) {
                console.log ( data )
            } // showme func.
        function more ( data ) {
                console.log ( data )
            } // more func.
        const 
            hubDescription = {
                            reactivity : [
                                              [ 'one', 'active', 'two', 'activate'  ]
                                            , [ 'two', 'active', 'showme' ]
                                        ]      
                        }
        const hub = new FsmHub ( hubDescription );
        hub.addFunctions ( { showme, more })

        const activeCallbacks = Object.keys ( hub.callbacks );        
        expect ( activeCallbacks.length ).to.be.equal ( 1 )   // function 'more' should be register only in fnCallbacks.

        expect ( hub.callbacks ).to.have.property ( 'two/active' )
        expect ( hub.callbacks['two/active']).to.be.an ( 'array' )
        expect ( hub.callbacks['two/active'][0]).to.be.equal ( 'showme' )

        expect ( hub.fnCallbacks ).to.have.property ( 'showme' )
        expect ( hub.fnCallbacks ).to.have.property ( 'more' )
        expect ( typeof hub.fnCallbacks['showme']).to.be.equal ( 'function' )
        expect ( typeof hub.fnCallbacks['more']).to.be.equal ( 'function' )
    }) // register a fsm





it ( 'Add a fsm', () => {
        const 
            mini = {
                              init : 'none'
                            , table : [
                                        [ 'none', 'activate', 'active', 'switchOn']
                                    ]
                    };
        const machine = new Fsm ( mini );
        const 
            hubDescription = {
                            reactivity : [
                                              [ 'one', 'active', 'two', 'activate'  ]
                                            , [ 'two', 'active', 'showme' ]
                                        ]
                            , transformers : {
                                            // "from/to" : functionName
                                            'two/showme' : 'simple'
                                        }       
                        }
        const hub = new FsmHub ( hubDescription );
        hub.addFsm ( { one:machine })

        expect ( hub.fsm ).to.have.property ( 'one' )
    }) // register a fsm





it ( 'Use hub-transformer', done  => {
        // Define Fsm machines
        const 
            miniOne = {
                              init  : 'none'
                            , table : [
                                        [ 'none', 'activate', 'active', 'switchOn']
                                     ]
                    };

        // Setup fsm transition libraries
        const transitionOne = {
                        switchOn ( task, dependencies, stateObj, data ) {
                                    task.done ({ 
                                              success  : true 
                                            , response : data
                                        })
                            }
                };

        // Init fsm machines
        const  // oneFsm and twoFsm are identical
              one = new Fsm ( miniOne, transitionOne  )
            , two = new Fsm ( miniOne, transitionOne  )
            ;

        // Define hub
        const 
            hubMachine = {
                            reactivity : [
                                              [ 'one', 'active', 'two', 'activate'  ]
                                            , [ 'two', 'active', 'showme' ]
                                        ]
                            , transformers : {
                                            // "from/to" : functionName
                                            'two/showme' : 'simple'
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
        const hub = new FsmHub ( hubMachine, transformerLib );
        
        function showme (transitionResult) {
                    const {
                              second
                            , state
                            , answer 
                        } = transitionResult;

                    expect ( second ).to.be.equal ( 'second' )
                    expect ( state ).to.be.equal ( 'active' )
                    expect ( answer ).to.be.equal ( 'try' )
                    done ()
            } // showme func.

        hub.addFsm ({  one, two })
        hub.addFunctions ( { showme  })

        // Start!
        one.update ( 'activate', 'try' )
    }) // it use hub-transformer





it ( 'Wrong length of reactivity record', () => {
        // Define hub
        const 
            hubDetails = {
                            reactivity : [
                                              [ 'one', 'active', 'two', 'activate', 'aloha'  ]
                                            , [ 'two', 'active', 'showme' ]
                                        ]
                            , transformers : {
                                            // "from/to" : functionName
                                            'two/showme' : 'simple'
                                        }       
                        };
        const originalDebugger = FsmHub.prototype._debugger;
        FsmHub.prototype._debugger  = function ( str, data ) {
                                        expect ( str ).to.be.equal ( WRONG_REACTIVITY_RECORD )
                                }
        const hub = new FsmHub ( hubDetails );

        expect ( hub.callbacks ).to.have.property ( 'two/active' )
        expect ( hub.callbacks ['two/active'][0]).to.be.equal ( 'showme' )
        FsmHub.prototype._debugger = originalDebugger
    }) // it wrong reactivity record





it ( 'Wrong type of reactivity record', () => {
        const 
            hubDetails = {
                            reactivity : [
                                              { 'one' : 'something' }
                                            , [ 'two', 'active', 'showme' ]
                                        ]
                            , transformers : {
                                            // "from/to" : functionName
                                            'two/showme' : 'simple'
                                        }       
                        };
        const originalDebugger = FsmHub.prototype._debugger;
        FsmHub.prototype._debugger  = function ( str, data ) {
                                        expect ( str ).to.be.equal ( WRONG_REACTIVITY_RECORD )
                    }
        const hub = new FsmHub ( hubDetails );

        expect ( hub.callbacks ).to.have.property ( 'two/active' )
        expect ( hub.callbacks ['two/active'][0]).to.be.equal ( 'showme' )
        FsmHub.prototype._debugger = originalDebugger
    }) // it wrong reactivity record




it ( 'Try to add FSM name that is already registered', () => {
        const 
            miniOne = {
                              init  : 'none'
                            , table : [
                                        [ 'none', 'activate', 'active', 'switchOn']
                                     ]
                    };

        
        const one = new Fsm ( miniOne );

        // Define hub
        const 
            hubDescription = {
                            reactivity : [
                                              [ 'one', 'active', 'two', 'activate'  ]
                                            , [ 'two', 'active', 'showme' ]
                                        ]
                        };
        // Initialize the hub
        const hub = new FsmHub ( hubDescription );
        hub._debugger  = function ( str, data ) {
                    expect ( str ).to.be.equal ( REGISTERED_FSM_NAME )
                }

        hub.addFsm ({one})
        hub.addFsm ({one})

        const fsmList = Object.keys ( hub.fsm );
        expect ( fsmList ).to.have.length ( 1 )
        expect ( fsmList[0]).to.be.equal ( 'one' )

    }) // it registered fsm name




it ( 'Try to add function name that is already registered', () => {
        const 
            machine = {
                            reactivity : [
                                              [ 'one', 'active', 'two', 'activate'  ]
                                            , [ 'two', 'active', 'showme' ]
                                        ]
                        };
        const hub = new FsmHub ( machine );
        hub._debugger  = function ( str, data ) {
                    expect ( str ).to.be.equal ( REGISTERED_FUNCTION_NAME )
                }


        function dummy ( data ) { 
                console.log ( 'dummy function' )
            }

        hub.addFunctions ({ dummy })
        hub.addFunctions ({ dummy })

        const fnCallbacks = Object.keys ( hub.fnCallbacks );
        expect ( fnCallbacks ).to.have.length (1)
        expect ( fnCallbacks[0]).to.be.equal ( 'dummy' )
    }) // it registered function name






it ( 'Not registered fsm subscriber', done => {
        const 
            miniOne = {
                              init  : 'none'
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
              one = new Fsm ( miniOne, transitionOne  )
            , two = new Fsm ( miniOne, transitionOne  )
            ;

        // Define hub
        const 
            machine = {
                            reactivity : [
                                              [ 'one', 'active', 'two', 'activate'  ]
                                            , [ 'two', 'active', 'showme' ]
                                        ]
                            , transformers : {
                                            // "from/to" : functionName
                                            'two/showme' : 'simple'
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
        const hub = new FsmHub ( machine, transformerLib );

        hub.addFsm ({  one })
        hub._debugger = function ( str, data ) {
                expect ( str ).to.be.equal ( MISSING_FSM )
                done ()
            }

        // Start!
        one.update ( 'activate', 'try' )
}) // it not registered fsm





it ( 'Transformer is not a function', () => {
  const 
            miniOne = {
                              init  : 'none'
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
              one = new Fsm ( miniOne, transitionOne  )
            , two = new Fsm ( miniOne, transitionOne  )
            ;

        // Define hub
        const 
            machine = {
                            reactivity : [
                                              [ 'one', 'active', 'two', 'activate'  ]
                                            , [ 'two', 'active', 'showme' ]
                                        ]
                            , transformers : {
                                            // "from/to" : functionName
                                            'two/showme' : 'simple'
                                        }       
                        }
        , transformerLib = {
                            simple : { fake : 'fake transformer' }   // if transformer is not a function
                        }
        ;
        // Initialize the hub
        const hub = new FsmHub ( machine, transformerLib );

        hub.addFsm ({  one, two })
        // hub._debugger = function ( str, data ) {
        //         expect ( str ).to.be.equal ( MISSING_FSM )
        //         done ()
        //     }

        // Start!
        one.update ( 'activate', 'try' )
}) // it Transformer is not a function





it ( 'Callback-function with data argument', done  => {
    const 
              miniOne = {
                                init  : 'none'
                              , table : [
                                            [ 'none', 'activate', 'active', 'switchOn']
                                          , [ 'active', 'stop', 'none', 'switchOff']
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
                          , switchOff ( task, dependencies, stateObj, dt ) {
                                      task.done ({ 
                                                success  : true 
                                              , response : dt
                                          })
                              }
                  };
  
          // Init fsm machines
          const 
                one = new Fsm ( miniOne, transitionOne  )
              , two = new Fsm ( miniOne, transitionOne  )
              ;
  
          // Define hub
          const 
              machine = {
                              reactivity : [
                                                [ 'one', 'active', 'two', 'activate'  ]
                                              , [ 'one', 'active', 'showme'           ]
                                              , [ 'one', 'none'  , 'two', 'stop'      ]
                                              , [ 'two', 'none'  , 'final'             ]
                                          ]
                              , transformers : {
                                              'one/showme' : 'simple'
                                          }       
                          }
            , transformerLib = {
                                simple ( state, data ) { return { try: `simple-${state}-${data.try}`} }
                            }
            ;
          // Initialize the hub
          const hub = new FsmHub ( machine, transformerLib );
          function showme ( data ) {
                                expect ( data.try ).to.equal ( 'simple-active-try' )
                                expect ( two.state == 'active' )
                                one.update ( 'stop' )
                } // showme func.

          function final ( data ) {
                                expect ( two.state ).to.be.equal ( 'none' )
                                done ()
                } // final func.

          hub.addFsm ({  one, two })
          hub.addFunctions ({ showme, final })
          // Start!
          one.update ( 'activate', { try:'try'} )
  }) // it callback-function with data argument




  it ( 'Test a Debugger', () => {
    const 
        machine = {
                        reactivity : [
                                          [ 'one', 'active', 'two', 'activate'  ]
                                        , [ 'two', 'active', 'showme' ]
                                    ]
                        , debug : true
                    };
    const hub = new FsmHub ( machine );
    hub._debugger ( 'Test for %s', 'debugger' )
}) // it Test debugger



  
}) // describe


