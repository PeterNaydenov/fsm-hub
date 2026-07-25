import { describe, it, expect } from 'vitest'
import FsmHub from '../src/main.js'
import Fsm from '@peter.naydenov/fsm'

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

        expect ( hub ).toHaveProperty ( 'fsm' )
        expect ( hub ).toHaveProperty ('fnCallbacks')
        expect ( hub ).toHaveProperty ( 'transformers' )
        expect ( hub ).toHaveProperty ( 'subscribers' )
        expect ( hub ).toHaveProperty ( 'actions' )
        expect ( hub ).toHaveProperty ( 'callbacks' )

        expect ( hub.subscribers ).toHaveProperty ( 'one/active' )
        expect ( Array.isArray ( hub.subscribers['one/active'] ) ).toBe ( true )
        expect ( hub.subscribers['one/active'][0] ).toBe ( 'two' )

        expect ( hub.actions ).toHaveProperty ( 'one/active/two' )
        expect ( hub.actions['one/active/two']).toBe ( 'activate' )

    }) // it hub structure






it ( 'Add a fsm', () => {
        const
            miniMachine = {
                              init : 'none'
                            , behavior : [
                                        [ 'none', 'activate', 'active', 'switchOn']
                                    ]
                    };
        const machine = new Fsm ( miniMachine );
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

        expect ( hub.fsm ).toHaveProperty ( 'one' )
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
        expect ( activeCallbacks.length ).toBe ( 1 )   // function 'more' should be register only in fnCallbacks.

        expect ( hub.callbacks ).toHaveProperty ( 'two/active' )
        expect ( Array.isArray ( hub.callbacks['two/active'] ) ).toBe ( true )
        expect ( hub.callbacks['two/active'][0]).toBe ( 'showme' )

        expect ( hub.fnCallbacks ).toHaveProperty ( 'showme' )
        expect ( hub.fnCallbacks ).toHaveProperty ( 'more' )
        expect ( typeof hub.fnCallbacks['showme']).toBe ( 'function' )
        expect ( typeof hub.fnCallbacks['more']).toBe ( 'function' )
    }) // register a fsm






it ( 'Add a fsm', () => {
        const
            mini = {
                              init : 'none'
                            , behavior : [
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

        expect ( hub.fsm ).toHaveProperty ( 'one' )
    }) // register a fsm






it ( 'Use hub-transformer', () => new Promise ( resolve => {
        // Define Fsm machines
        const
            miniOne = {
                              init  : 'none'
                            , behavior : [
                                        [ 'none', 'activate', 'active', 'switchOn']
                                     ]
                    };

        // Setup fsm transition libraries
        const transitionOne = {
                        switchOn ( {task}, data ) {
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
console.log ( second, state, answer )
                    expect ( second ).toBe ( 'second' )
                    expect ( state ).toBe ( 'active' )
                    expect ( answer ).toBe ( 'try' )
                    resolve ()
            } // showme func.

        hub.addFsm ({  one, two })
        hub.addFunctions ( { showme  })

        // Start!
        one.update ( 'activate', 'try' )
    })) // it use hub-transformer






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
                                        expect ( str ).toBe ( WRONG_REACTIVITY_RECORD )
                                }
        const hub = new FsmHub ( hubDetails );

        expect ( hub.callbacks ).toHaveProperty ( 'two/active' )
        expect ( hub.callbacks ['two/active'][0]).toBe ( 'showme' )
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
                                        expect ( str ).toBe ( WRONG_REACTIVITY_RECORD )
                    }
        const hub = new FsmHub ( hubDetails );

        expect ( hub.callbacks ).toHaveProperty ( 'two/active' )
        expect ( hub.callbacks ['two/active'][0]).toBe ( 'showme' )
        FsmHub.prototype._debugger = originalDebugger
    }) // it wrong reactivity record





it ( 'Try to add FSM name that is already registered', () => {
        const
            miniOne = {
                              init  : 'none'
                            , behavior : [
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
                    expect ( str ).toBe ( REGISTERED_FSM_NAME )
                }

        hub.addFsm ({one})
        hub.addFsm ({one})

        const fsmList = Object.keys ( hub.fsm );
        expect ( fsmList ).toHaveLength ( 1 )
        expect ( fsmList[0]).toBe ( 'one' )

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
                    expect ( str ).toBe ( REGISTERED_FUNCTION_NAME )
                }


        function dummy ( data ) {
                console.log ( 'dummy function' )
            }

        hub.addFunctions ({ dummy })
        hub.addFunctions ({ dummy })

        const fnCallbacks = Object.keys ( hub.fnCallbacks );
        expect ( fnCallbacks ).toHaveLength (1)
        expect ( fnCallbacks[0]).toBe ( 'dummy' )
    }) // it registered function name






it ( 'Not registered fsm subscriber', () => new Promise ( resolve => {
        const
            miniOne = {
                              init  : 'none'
                            , behavior : [
                                        [ 'none', 'activate', 'active', 'switchOn']
                                     ]
                    };

        // Setup fsm transition libraries
        const transitionOne = {
                        switchOn ( {task}, data ) {
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
                expect ( str ).toBe ( MISSING_FSM )
                resolve ()
            }

        // Start!
        one.update ( 'activate', 'try' )
})) // it not registered fsm






it ( 'Transformer is not a function', () => {
  const
            miniOne = {
                              init  : 'none'
                            , behavior : [
                                        [ 'none', 'activate', 'active', 'switchOn']
                                     ]
                    };

        // Setup fsm transition libraries
        const transitionOne = {
                        switchOn ( {task}, data ) {
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
        //         expect ( str ).toBe ( MISSING_FSM )
        //         done ()
        //     }

        // Start!
        one.update ( 'activate', 'try' )
}) // it Transformer is not a function






it ( 'Callback-function with data argument', () => new Promise ( resolve => {
    const
              miniOne = {
                                init  : 'none'
                              , behavior : [
                                            [ 'none', 'activate', 'active', 'switchOn']
                                          , [ 'active', 'stop', 'none', 'switchOff']
                                       ]
                      };

          // Setup fsm transition libraries
          const transitionOne = {
                          switchOn ( {task}, data ) {
                                      task.done ({
                                                success  : true
                                              , response : data
                                          })
                              }
                          , switchOff ( {task}, data ) {
                                      task.done ({
                                                success  : true
                                              , response : data
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
                                expect ( data.try ).toBe ( 'simple-active-try' )
                                expect ( two.getState () == 'active' )
                                one.update ( 'stop' )
                } // showme func.

          function final ( data ) {
                                expect ( two.getState() ).toBe ( 'none' )
                                resolve ()
                } // final func.

          hub.addFsm ({  one, two })
          hub.addFunctions ({ showme, final })
          // Start!
          one.update ( 'activate', { try:'try'} )
  })) // it callback-function with data argument




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




    // =====================================================================
    // BUG REGRESSIONS
    // =====================================================================

    // -----------------------------------------------------------------
    // BUG A — _callback.js passed `fsmSubscriber` (the whole array of
    // subscriber names) as the data arg to MISSING_FSM, instead of
    // `subscriberName` (the specific missing one). The warning message
    // therefore looked like
    //   `Warning: Fsm "%s" is not registered to the hub. [ 'two' ]`
    // instead of the intended
    //   `Warning: Fsm "%s" is not registered to the hub. two`.
    // The existing test "Not registered fsm subscriber" only checks the
    // `str` half of the call, so the wrong data was never noticed.
    // -----------------------------------------------------------------
    it ( 'BUG A — MISSING_FSM is logged with the missing name, not the array', () => new Promise ( resolve => {
        const
              mini = {
                          init : 'none'
                        , behavior : [
                                        [ 'none', 'activate', 'active', 'switchOn' ]
                                    ]
                        }
            , lib  = {
                          switchOn ({ task }, data) {
                                  task.done ({ success : true, response : data })
                              }
                        }
            , one = new Fsm ( mini, lib )
            ;
        const hub = new FsmHub ({
                        reactivity : [
                                          [ 'one', 'active', 'two', 'activate' ]
                                        ]
                    });
        const calls = [];
        hub._debugger = ( str, data ) => calls.push ({ str, data });
        hub.addFsm ({ one });   // 'two' is intentionally NOT registered

        one.update ( 'activate', 'try' );

        setTimeout ( () => {
            const missing = calls.find ( c => c.str === MISSING_FSM )
            expect ( missing, 'MISSING_FSM was not logged' ).toBeDefined ()
            // The data should be the missing name 'two' (a string),
            // NOT the whole subscribers array.
            expect ( missing.data ).toBe ( 'two' )
            resolve ()
        }, 50 )
    })) // it BUG A

    // -----------------------------------------------------------------
    // BUG B — _callback.js crashed with
    //   `TypeError: Cannot read properties of null (reading 'answer')`
    // when a callback rule (length 3 in `reactivity`) was triggered
    // and the FSM's response was `null` (and no transformer was
    // configured, or the transformer itself returned `null`).
    //
    // The existing test "Callback-function with data argument" always
    // passes a non-null `response`, so this path was never exercised.
    // -----------------------------------------------------------------
    it ( 'BUG B — callback rule with null response does not crash', () => new Promise ( resolve => {
        const
              mini = {
                          init : 'none'
                        , behavior : [
                                        [ 'none', 'activate', 'active', 'switchOn' ]
                                    ]
                        }
            // Transition returns response: null. No transformer.
            , lib  = {
                          switchOn ({ task }) {
                                  task.done ({ success : true, response : null })
                              }
                        }
            , one = new Fsm ( mini, lib )
            ;
        const hub = new FsmHub ({
                        reactivity : [
                                          // length-3 rule = callback, no fsm subscriber
                                          [ 'one', 'active', 'showme' ]
                                        ]
                    });
        function showme ( data ) {
                            // The crash happened BEFORE this was called.
                            // We just want to assert: the callback fires
                            // and `data` is what the response was (null).
                            expect ( data ).toBeNull ()
                            resolve ()
                        } // showme func.
        hub.addFsm    ({ one });
        hub.addFunctions ({ showme });

        one.update ( 'activate' );
    })) // it BUG B — null response

    it ( 'BUG B — callback rule with a transformer that returns null does not crash', () => new Promise ( resolve => {
        const
              mini = {
                          init : 'none'
                        , behavior : [
                                        [ 'none', 'activate', 'active', 'switchOn' ]
                                    ]
                        }
            , lib  = {
                          switchOn ({ task }, data) {
                                  task.done ({ success : true, response : data })
                              }
                        }
            , one = new Fsm ( mini, lib )
            ;
        const hub = new FsmHub ({
                        reactivity : [
                                          [ 'one', 'active', 'showme' ]
                                        ]
                        , transformers : {
                                            'one/showme' : 'nullTransformer'
                                        }
                    }, {
                        // A transformer that returns null. This used to
                        // crash in _callback.js's `data.answer` check.
                        nullTransformer () { return null }
                    });
        function showme ( data ) {
                            expect ( data ).toBeNull ()
                            resolve ()
                        } // showme func.
        hub.addFsm    ({ one });
        hub.addFunctions ({ showme });

        one.update ( 'activate', 'try' );
    })) // it BUG B — null transformer




}) // describe

