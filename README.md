# Fsm-hub (@peter.naydenov/fsm-hub)

FSM orchestration and state managment tool.

Did you have tried `Fsm (@peter.naydenov/fsm)` till now? **Fsm-hub** extends `reactivity` control to this eco-system. **Fsm-hub** will listen for changes in all hub's registrated **machines(fsm)** and will trigger an execution of callback code - **listener functions** or **update with action in other fsm machines**. Register all **fsm machine** instances and form an `application with centralized control of the logic`.





## Fsm-hub Description Object
Fsm-hub's description is an object that contains information about how the hub should work. Description contains **reactivity and transformation** tables. Provide the description object during the hub creation process.

```js 
const hub = new FsmHub ( description, transformerLibrary )

```
TransformerLibrary is an object with functions used in **transformation process** described later in this document.





## Description\Reactivity
**Fsm-hub** reactivity is described as a table. Every single row describes single **reactivity-reaction**. Remember that **reactivity reaction** is always an array. Reactivity is part of fsm-hub description object.

### Reactivity-Reaction with 3 Elements
Reaction on state-change with **listener function**. The row has 3 elements:

```js
[ 'machine', 'open', 'listenerFn']

```

Read it as: When fsm `machine` change it status to `open` then execute the function `listenerFn`.

### Reactivity-Reaction with 4 Elements
Reaction on state-change with **update-action in another fsm**. The row contains 4 elements:

```js
[ 'machine', 'open', 'camera', 'wake' ]

```
Read it as: When fsm `machine` change it status to `open` then fsm `camera` should trigger update with action `wake`.


### Reactivity Rules
Execution of **reactivity reactions** goes always from top to bottom by type. **Fsm-hub** will execute fsm updates first and then will trigger the listener functions. Example:

```js
[
    [ 'machine', 'open', 'informSecurity' ]
    [ 'machine', 'open', 'activateLights' ]
    [ 'machine', 'open', 'camera', 'wake' ]
]
```
Order of execution:
1. Will trigger fsm update of the `camera` fsm with action `wake`.
2. Will trigger listener function `informSecurity`.
3. Will trigger listener function `activateLights`.







## Description\Transformers (not required)
Transformers take care of data-compatibility across the hub. Fsm machines registrated to the hub could vary in their update-results data structures. Transformers can apply data-model where is needed. Example:

```js
 {
    //    from/to     :  functionName
      'oneFsm/twoFsm' : 'one2two'
    , 'twoFsm/showme' : 'simple' 
 }
```

Read as:
- Row 1: Listener `twoFsm` will use transformer function `one2two` for results of state-changes in `oneFsm`;
- Row 2: Listener `showme` will use transformer function `simple` for results of state-changes in `twoFsm`;

Transformer functions are defined in transformerLibrary object, that is provided as second parameter during hub-creation. Missing transformer means that the result of update will be provided to the listener without modifications. Transformers are available for both type of listeners: **fsm machines** and **functions**. 





## Transformer functions
Transformer function are receiving two arguments - **fsm state after update** and **result from response object**. Transformer response is provided to the listener as an argument.

```js
 const transformerLib = {
     one2two ( stateUpdate, result ) { // stateUpdate is the state of fsm, result is from fsm transition response.
                switch ( status ) {
                    case 'none' :
                                return result   // ...in case of state 'none': Provide result to the listener without changes
                    case 'active':
                                let x;
                                if ( result == 'none' )   x = {name: 'abc', project: 'undefined' }
                                else                      x = { name: result.name, project: result.project }
                                return x
                    default:
                                return false
                } // switch status
        } // one2two func.
 } // transformerLib
```


## Methods

```js
   constructor  : 'Create the hub. Provide hub-description object and transformation'
 , addFsm       : 'Register fsm instances to the hub'
 , addFunctions : 'Register callback function to the hub'

```




## Example
Create hub and register two fsm machines: **oneFsm** and **twoFsm**. Register also a callback function **showme**.

Hub should start **twoFsm** when **oneFsm** is started. When **twoFsm** is `active` trigger a **showme** callback function. The transformer `twoFsm/showme` should be applied.

```js
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
                                        , response : dt   // send data without changes
                                    })
                        }
            };



// Init fsm machines
    const  // oneFsm and twoFsm are identical fsm machines
          one = new Fsm ( miniOne, transitionOne  )
        , two = new Fsm ( miniOne, transitionOne  )
        ;




// Define hub
const 
        machine = {
                        reactivity : [
                                    //    [ fsm, onStateChange, listenerFsm , action  ]
                                          [ 'one', 'active', 'two', 'activate'  ]
                                    //    [ 'fsm',     'state', 'callbackFn' ]
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
                                                , 'answer' : resultResponseData.response
                                            }
                                    } 
                    }
      ;

// Initialize the hub
    let hub = new FsmHub ( machine, transformerLib );

    function showme (transitionResult) {
                console.log ( 'ShowMe' )
                console.log ( transitionResult.answer )
        } // showme func.

    hub.addFsm ({ one, two })
    hub.addFunctions ( { showme })

// Start!
    oneFsm.update ( 'activate', { response:'try'} )

// Result on the screen:
// ShowMe
// { second: 'second', state: 'active', answer: 'try' }

```



## Release History

### 2.0.0 ( 2022-11-16 )
- [x] The library become a ES module;



### 1.0.5 ( 2022-05-27 )
 - [x] Just a dependency update;

### 1.0.4 ( 2021-04-02 )
 - [x] Fix: Duplicated update callback if logic contain a chainAction;

### 1.0.3 ( 2021-03-26 )
 - [x] Massive code refactoring;
 - [ ] Bug: Duplicated update callback if logic contain a chainAction;






 ## Credits
'@peter.naydenov/fsm-hub' was created by Peter Naydenov.


## License
'@peter.naydenov/fsm-hub' is released under the MIT License.


