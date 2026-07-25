import { describe, it, expect } from 'vitest'
import FsmHub from '../src/main.js'
import Fsm from '@peter.naydenov/fsm'

describe ( 'Fsm Hub', () => {

  it ( 'Check multiple systems', () => new Promise ( resolve => {

    /**
     *  Description:
     *    Create a 3 fsm systems - human, spy, and recorder
     *    - Human: Can receive good and bad news and change his mood according the news;
     *    - Spy: Spy on human and sends to recorder the messages that make him unhappy;
     *    - Recorder: Storage for bad news. When messages are 3 will stop with the recording and will call function "TimeForChange"
     */

    const
          recorderDescription = {  // Description of the recorder
                              init  : 'empty'
                            , behavior : [
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
                            , behavior : [
                                              [  'happy'   , 'goodNews', 'happy'   , 'feel_happy' ]
                                            , [  'happy'   , 'badNews' , 'unhappy' , 'feel_bad'   ]
                                            , [  'unhappy' , 'badNews' , 'unhappy' , 'feel_bad'   ]
                                            , [  'unhappy' , 'goodNews', 'happy'   , 'feel_bad'   ]
                                  ]
            }
        , spyDescription = {
                              init: 'positive'
                            , behavior : [
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
                                    , [ 'recorder' , 'full'     , 'test'                       ]
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
                          feel_happy ({task}, data ) {
                                    task.done ({
                                                      success : true
                                                    , response : data
                                                })
                            }
                        , feel_bad ( {task}, data ) {
                                    task.done ({
                                                  success : true
                                                , response: data
                                            })
                            }
                }
            , spyLib = {
                          onBad ( {task}, data  ) {
                                    task.done ({
                                                  success   : true
                                                , response  : data
                                            })
                            }
                        , onGood ( {task}, data ) {
                                    task.done ({
                                                  success : true
                                                , response : data
                                            })
                            }
                }
            , recorderLib = {
                          add_a_warning ( { task, extractList }, data ) {
                                    const  [ reasons ]  = extractList (['reasons']);
                                    if ( !reasons.includes(data.response) )   reasons.push ( data.response )
                                    task.done ({
                                              success : true
                                            , stateData : { reasons }
                                            , response : data
                                        })
                            }
                        , check_if_full ( {task, extractList}, data ) {
                                    const  [ reasons ]  = extractList (['reasons']);
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
                    expect ( result ).toBe ( 'DONE' )
                    expect ( theHub.cache.isEmpty ()         ).toBe ( true )
                    expect ( theHub.cacheInternal.isEmpty () ).toBe ( true )
                    let [ rec ] = recorder.extractList (['reasons'], { as: 'std'})

                    expect ( Array.isArray ( rec ) ).toBe ( true )
                    expect ( rec ).toHaveLength ( 3 )
                    expect ( rec[0] ).toBe ( 'Car crash'      )
                    expect ( rec[1] ).toBe ( 'Airplane crash' )
                    expect ( rec[2] ).toBe ( 'Storm'          )
                    resolve ()
        }

    theHub.addFsm ({ human, spy, recorder })
    theHub.addFunctions ({ timeForChange, test })

    human.update ( 'goodNews', 'friends' )
    human.update ( 'badNews', 'Car crash' )
    human.update ( 'badNews', 'Airplane crash' )
    human.update ( 'badNews', 'Storm' )

})) // it check multiple systems






}) // describe

