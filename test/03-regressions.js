import { describe, it, expect, vi, afterEach } from 'vitest'
import FsmHub from '../src/main.js'
import Fsm from '@peter.naydenov/fsm'

const sleep = ms => new Promise ( resolve => setTimeout ( resolve, ms ))

/**
 * Machine 'idle' -> 'on' with action 'go'. 'on' + 'go' stays 'on'.
 * 'fail' is a defined transition that does not succeed.
 */
function machine ({ delay=0, response } = {}) {
    return new Fsm ({
                  init : 'idle'
                , behavior : [
                                  [ 'idle', 'go'  , 'on', 'go'   ]
                                , [ 'on'  , 'go'  , 'on', 'go'   ]
                                , [ 'on'  , 'fail', 'off', 'fail' ]
                            ]
            }, {
                  go ({ task }) {
                            const finish = () => task.done ({ success: true, response })
                            if ( delay )   setTimeout ( finish, delay )
                            else           finish ()
                    }
                , fail ({ task }) { task.done ({ success: false }) }
            })
} // machine func.



describe ( 'Regressions 3.0.0', () => {

afterEach ( () => vi.restoreAllMocks () )



describe ( 'Scheduler', () => {

    it ( 'Update queued during a chain reaction is processed', async () => {
            const
                  log = []
                , hub = new FsmHub ({ reactivity: [
                                              [ 'a'   , 'on', 'slow', 'go' ]
                                            , [ 'slow', 'on', 'logSlow'    ]
                                            , [ 'c'   , 'on', 'logC'       ]
                                    ]})
                , a = machine (), slow = machine ({ delay: 20 }), c = machine ()
                ;
            hub.addFsm ({ a, slow, c })
            hub.addFunctions ({ logSlow: () => log.push ( 'slow' ), logC: () => log.push ( 'c' ) })

            a.update ( 'go' )
            await sleep ( 5 )
            c.update ( 'go' )   // 'slow' is still running
            await sleep ( 60 )

            expect ( log ).toEqual ([ 'slow', 'c' ])
            expect ( hub.lock ).toBe ( false )
            expect ( hub.cache.isEmpty () ).toBe ( true )
            expect ( hub.cacheInternal.isEmpty () ).toBe ( true )
        }) // it update queued during a chain reaction



    it ( 'Several queued updates are processed in FIFO order', async () => {
            const
                  log = []
                , hub = new FsmHub ({ reactivity: [
                                              [ 'a', 'on', 'slow', 'go' ]
                                            , [ 'c', 'on', 'logC' ]
                                            , [ 'd', 'on', 'logD' ]
                                            , [ 'e', 'on', 'logE' ]
                                    ]})
                , a = machine (), slow = machine ({ delay: 20 })
                , c = machine (), d = machine (), e = machine ()   // No responses
                ;
            hub.addFsm ({ a, slow, c, d, e })
            hub.addFunctions ({
                          logC : () => log.push ( 'c' )
                        , logD : () => log.push ( 'd' )
                        , logE : () => log.push ( 'e' )
                    })

            a.update ( 'go' )
            await sleep ( 5 )
            c.update ( 'go' );   d.update ( 'go' );   e.update ( 'go' )
            await sleep ( 60 )

            expect ( log ).toEqual ([ 'c', 'd', 'e' ])
            expect ( hub.lock ).toBe ( false )
        }) // it several queued updates



    it ( 'Follow-on updates run before queued external updates', async () => {
            const
                  log = []
                , hub = new FsmHub ({ reactivity: [
                                              [ 'a'   , 'on', 'slow', 'go' ]
                                            , [ 'slow', 'on', 'logSlow'    ]
                                            , [ 'b'   , 'on', 'logB'       ]
                                    ]})
                , a = machine (), slow = machine ({ delay: 20 }), b = machine ({ response: { x: 1 } })
                ;
            hub.addFsm ({ a, slow, b })
            hub.addFunctions ({ logSlow: () => log.push ( 'slow' ), logB: () => log.push ( 'b' ) })

            a.update ( 'go' )
            await sleep ( 5 )
            b.update ( 'go' )   // A response does not make an unrelated update internal
            await sleep ( 5 )
            expect ( log ).toEqual ([])
            expect ( hub.lock ).toBe ( true )

            await sleep ( 50 )
            expect ( log ).toEqual ([ 'slow', 'b' ])
            expect ( hub.lock ).toBe ( false )
        }) // it follow-on updates first

}) // describe Scheduler



describe ( 'Errors in listeners', () => {

    it ( 'Throwing callback is logged and the hub keeps working', async () => {
            const
                  error = vi.spyOn ( console, 'error' ).mockImplementation ( () => {} )
                , calls = []
                , hub = new FsmHub ({ reactivity: [ [ 'a', 'on', 'bad' ], [ 'a', 'on', 'good' ] ]})
                , a = machine ()
                ;
            hub.addFsm ({ a })
            hub.addFunctions ({
                          bad  : () => { calls.push ( 'bad' ); throw new Error ( 'boom' ) }
                        , good : () => calls.push ( 'good' )
                    })

            a.update ( 'go' )
            await sleep ( 5 )
            a.update ( 'go' )
            await sleep ( 5 )

            expect ( calls ).toEqual ([ 'bad', 'good', 'bad', 'good' ])
            expect ( error ).toHaveBeenCalledTimes ( 2 )
            expect ( error.mock.calls[0][0] ).toBe ( 'Error: Listener "%s" failed.' )
            expect ( error.mock.calls[0][1] ).toBe ( 'bad' )
            expect ( error.mock.calls[0][2].message ).toBe ( 'boom' )
            expect ( hub.lock ).toBe ( false )
        }) // it throwing callback



    it ( 'Throwing transformer is logged and the hub keeps working', async () => {
            const
                  error = vi.spyOn ( console, 'error' ).mockImplementation ( () => {} )
                , calls = []
                , hub = new FsmHub ({
                                  reactivity   : [ [ 'a', 'on', 'b', 'go' ], [ 'b', 'on', 'report' ] ]
                                , transformers : { 'a/b': 'broken' }
                            }, {
                                  broken : () => { throw new Error ( 'bad transformer' ) }
                            })
                , a = machine (), b = machine ()
                ;
            hub.addFsm ({ a, b })
            hub.addFunctions ({ report: () => calls.push ( 'report' ) })

            a.update ( 'go' )
            await sleep ( 5 )
            expect ( error ).toHaveBeenCalledTimes ( 1 )
            expect ( error.mock.calls[0][1] ).toBe ( 'b' )
            expect ( b.getState () ).toBe ( 'idle' )
            expect ( hub.lock ).toBe ( false )

            b.update ( 'go' )
            await sleep ( 5 )
            expect ( calls ).toEqual ([ 'report' ])
        }) // it throwing transformer



    it ( 'Rejected subscriber update is logged and the reaction completes', async () => {
            const
                  error = vi.spyOn ( console, 'error' ).mockImplementation ( () => {} )
                , calls = []
                , hub = new FsmHub ({ reactivity: [ [ 'a', 'on', 'broken', 'go' ], [ 'a', 'on', 'report' ] ]})
                , a = machine ()
                , broken = {   // Minimal FSM-like object whose updates reject
                              on () {}
                            , update : () => Promise.reject ( new Error ( 'rejected' ) )
                        }
                ;
            hub.addFsm ({ a, broken })
            hub.addFunctions ({ report: () => calls.push ( 'report' ) })

            a.update ( 'go' )
            await sleep ( 5 )
            a.update ( 'go' )
            await sleep ( 5 )

            expect ( calls ).toEqual ([ 'report', 'report' ])
            expect ( error ).toHaveBeenCalledTimes ( 2 )
            expect ( error.mock.calls[0][1] ).toBe ( 'broken' )
            expect ( error.mock.calls[0][2].message ).toBe ( 'rejected' )
            expect ( hub.lock ).toBe ( false )
        }) // it rejected subscriber

}) // describe Errors in listeners



describe ( 'Names from Object.prototype', () => {

    it ( 'FSMs and callbacks can use names like "constructor" and "toString"', async () => {
            const
                  calls = []
                , hub = new FsmHub ({ reactivity: [ [ 'constructor', 'on', 'toString' ] ]})
                , ctor = machine ()
                ;
            hub.addFsm ({ constructor: ctor })
            hub.addFunctions ({ toString: () => calls.push ( 'toString' ) })
            expect ( hub.fsm.constructor ).toBe ( ctor )

            ctor.update ( 'go' )
            await sleep ( 5 )
            expect ( calls ).toEqual ([ 'toString' ])
        }) // it prototype names



    it ( 'Unregistered "valueOf" callback is reported, not called', async () => {
            const
                  log = vi.spyOn ( console, 'log' ).mockImplementation ( () => {} )
                , hub = new FsmHub ({ reactivity: [ [ 'a', 'on', 'valueOf' ], [ 'a', 'on', 'report' ] ], debug: true })
                , a = machine ()
                , calls = []
                ;
            hub.addFsm ({ a })
            hub.addFunctions ({ report: () => calls.push ( 'report' ) })

            a.update ( 'go' )
            await sleep ( 5 )
            expect ( log ).toHaveBeenCalledWith ( 'Warning: Function "%s" is not registered to the hub.', 'valueOf' )
            expect ( calls ).toEqual ([ 'report' ])
            expect ( hub.lock ).toBe ( false )
        }) // it unregistered valueOf



    it ( 'Transformer named "toString" is not taken from Object.prototype', async () => {
            const
                  received = []
                , hub = new FsmHub ({
                                  reactivity   : [ [ 'a', 'on', 'report' ] ]
                                , transformers : { 'a/report': 'toString' }
                            }, {})
                , a = machine ({ response: 'original' })
                ;
            expect ( hub.transformers ).not.toHaveProperty ( 'a/report' )
            hub.addFsm ({ a })
            hub.addFunctions ({ report: data => received.push ( data ) })

            a.update ( 'go' )
            await sleep ( 5 )
            expect ( received ).toEqual ([ 'original' ])
        }) // it transformer toString

}) // describe Names from Object.prototype



describe ( 'Failed transitions', () => {

    it ( 'Unknown action does not trigger reactions', async () => {
            const
                  calls = []
                , hub = new FsmHub ({ reactivity: [ [ 'a', 'on', 'report' ] ]})
                , a = machine ()
                ;
            hub.addFsm ({ a })
            hub.addFunctions ({ report: () => calls.push ( 'report' ) })

            a.update ( 'go' )
            await sleep ( 5 )
            a.update ( 'no-such-action' )
            await sleep ( 5 )
            expect ( a.getState () ).toBe ( 'on' )
            expect ( calls ).toEqual ([ 'report' ])
        }) // it unknown action



    it ( 'Transition with success:false does not trigger reactions', async () => {
            const
                  calls = []
                , hub = new FsmHub ({ reactivity: [ [ 'a', 'on', 'report' ] ]})
                , a = machine ()
                ;
            hub.addFsm ({ a })
            hub.addFunctions ({ report: () => calls.push ( 'report' ) })

            a.update ( 'go' )
            await sleep ( 5 )
            a.update ( 'fail' )
            await sleep ( 5 )
            expect ( a.getState () ).toBe ( 'on' )
            expect ( calls ).toEqual ([ 'report' ])
        }) // it success false



    it ( 'Successful transition to the same state triggers reactions', async () => {
            const
                  calls = []
                , hub = new FsmHub ({ reactivity: [ [ 'a', 'on', 'report' ] ]})
                , a = machine ()
                ;
            hub.addFsm ({ a })
            hub.addFunctions ({ report: () => calls.push ( 'report' ) })

            a.update ( 'go' )
            await sleep ( 5 )
            a.update ( 'go' )   // 'on' -> 'on'
            await sleep ( 5 )
            expect ( calls ).toEqual ([ 'report', 'report' ])
        }) // it same state



    it ( 'Chain with a successful first step triggers reactions', async () => {
            const
                  calls = []
                , hub = new FsmHub ({ reactivity: [ [ 'a', 'on', 'report' ] ]})
                , a = new Fsm ({
                              init : 'idle'
                            , behavior : [
                                              [ 'idle', 'go'   , 'on' , 'go'  , [ 'check', false ] ]
                                            , [ 'on'  , 'check', 'off', 'fail' ]
                                        ]
                        }, {
                              go   ({ task }) { task.done ({ success: true  }) }
                            , fail ({ task }) { task.done ({ success: false }) }
                        })
                ;
            hub.addFsm ({ a })
            hub.addFunctions ({ report: () => calls.push ( 'report' ) })

            a.update ( 'go' )   // 'go' succeeds, chained 'check' fails
            await sleep ( 5 )
            expect ( a.getState () ).toBe ( 'on' )
            expect ( calls ).toEqual ([ 'report' ])
        }) // it chain

}) // describe Failed transitions

}) // describe Regressions 3.0.0


