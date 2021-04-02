const
  FsmHub  = require ('../src/index.js')
, Fsm     = require ( '@peter.naydenov/fsm')
, expect  = require ( 'chai' ).expect
;

describe ( 'Fsm Hub', () => {

  it ( 'Check multiple systems', done => {
    
    /**
     *  Description:
     *   Create a 3 fsm systems - human, spy, and recorder
     *    - Human: Can receive good and bad news and change his mood according the news;
     *    - Spy: Spy on human and sends to recorder the messages that make him unhappy;
     *    - Recorder: Storage for bad news. When messages are 3 will stop with the recording and will call function "TimeForChange"
     */

    const 
          recorderDescription = {  // Description of the recorder
                              init  : 'empty'
                            , table : [
                                              [ 'empty' , 'write'   , 'used'  , 'add_a_warning'     ]
                                            , [ 'used'  , 'write'   , 'used'  , 'add_a_warning',   [ 'isFull?', false ]  ]
                                            , [ 'used'  , 'isFull?'  , 'full'  , 'check_if_full'    ]
                                    ]
                            , stateData : {
                                                reasons: []
                                            }
            }
        , humanDescription = {   // Very weak description of human emotions. Just for testing purposes
                              init  : 'happy'
                            , table : [
                                              [  'happy'   , 'goodNews', 'happy'   , 'feel_happy' ]
                                            , [  'happy'   , 'badNews' , 'unhappy' , 'feel_bad'   ]
                                            , [  'unhappy' , 'badNews' , 'unhappy' , 'feel_bad'   ]
                                            , [  'unhappy' , 'goodNews', 'happy'   , 'feel_bad'   ]
                                  ]
            }
        , spyDescription = {
                              init: 'positive'
                            , table : [
                                          [ 'positive', 'bad'  , 'negative' , 'onBad'  ]
                                        , [ 'negative', 'good' , 'positive' , 'onGood' ]
                                        , [ 'negative', 'bad'  , 'negative' , 'onBad'  ]
                                ]
            }
        , hubDescription = {
                            reactivity : [
                                      [ 'human'    , 'unhappy'  , 'spy'            , 'bad'     ]
                                    , [ 'spy'      , 'negative' , 'recorder'       , 'write'   ]
                                    , [ 'recorder' , 'full'     , 'timeForChange'              ]
                                    , [ 'recorder' , 'full'     , 'test'              ]
                                ]
                            , transformers : {
                                                  'human/spy'     : 'emotion2spy'
                                                , 'spy/recorder'  : 'spy2record'
                                            }
                    }
        ;
    // Define libs
    const
            humanLib = {
                          feel_happy (task,dependencies, stateData, data ) {
                                    task.done ({ 
                                                      success : true 
                                                    , response : data
                                                })
                            }
                        , feel_bad ( task, dependencies, stateData, data ) { 
                                    task.done ({ 
                                                  success : true 
                                                , response: data
                                            })
                            }
                }
            , spyLib = {
                          onBad ( task, dependencies, stateData, data  ) {
                                    task.done ({ 
                                                  success   : true 
                                                , response  : data
                                            })
                            }
                        , onGood ( task, dependencies, stateData, data ) {
                                    task.done ({ 
                                                  success : true 
                                                , response : data
                                            })
                            }
                }
            , recorderLib = {
                          add_a_warning ( task, dependencies, stateData, data ) {
                                    const { reasons } = stateData;
                                    if ( !reasons.includes(data.response) )   stateData.reasons.push ( data.response )
                                    task.done ({ 
                                              success : true 
                                            , stateData
                                            , response : data
                                        })
                            }
                        , check_if_full ( task, dependencies, stateData, data ) {
                                    const { reasons } = stateData;
                                    if ( reasons.length >= 3 )   task.done ({ success : true, response: data })
                                    else                         task.done ({ success : false, response: data })
                            }
                }
            , hubLib = {
                            emotion2spy ( state,response) { 
                                                return { response }
                                    }  
                          , spy2record  ( state, response ) { return response }
                }
            ;
    // Define machines and the hub
    const
              human    = new Fsm ( humanDescription , humanLib   )
            , spy      = new Fsm ( spyDescription , spyLib     )
            , recorder = new Fsm ( recorderDescription, recorderLib )
            , theHub   = new FsmHub ( hubDescription , hubLib  )
            ;
    let result = false
    
            
    function timeForChange ( state, response ) {
                        result = 'DONE'
        }

    function test ( state, response ) {
                    expect ( result ).to.be.equal ( 'DONE' )
                    expect ( theHub.cache.isEmpty ()         ).to.be.true
                    expect ( theHub.cacheInternal.isEmpty () ).to.be.true
                    let rec = recorder.exportState ().stateData.reasons
                    
                    expect ( rec ).to.be.an ( 'array' ) 
                    expect ( rec ).to.have.length ( 3 )
                    expect ( rec[0] ).to.be.equal ( 'Car crash'      )
                    expect ( rec[1] ).to.be.equal ( 'Airplane crash' )
                    expect ( rec[2] ).to.be.equal ( 'Storm'          )
                    done ()                    
        }

    theHub.addFsm ({ human, spy, recorder })
    theHub.addFunctions ({ timeForChange, test })

    human.update ( 'goodNews', 'friends' )
    human.update ( 'badNews', 'Car crash' )
    human.update ( 'badNews', 'Airplane crash' )
    human.update ( 'badNews', 'Storm' )

}) // it check multiple systems






}) // describe


