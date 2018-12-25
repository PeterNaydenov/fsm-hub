# Fsm-hub (@peter.naydenov/fsm-hub)

Did you have tried `Fsm (@peter.naydenov/fsm)` yet? **Fsm-hub** is an extension that can connect all existing  `Fsm` instances in the application and make them reactive by using `Fsm-hub` as communication chanel. Every `fsm relation` is described as row in a table:

```js
 
table : [
            // [ fsmName, state, listener         ] - option 1: The listener is a function
            // [ fsmName, state, listener, action ] - option 2: The listener is an onother fsm.
             [ 'One', 'stateOn', 'hello' ]
           , [ 'One', 'newState', 'Two' , 'reaction' ]
           // ... more rows like this
        ]
```
Read first row as "When fsm 'One' changes its state to 'stateOn', then call function hello".
Read second row as "When fsm 'One' changes its state to 'newState', then fsm 'Two' will trigger own update action - 'reaction'".

`Fsm-hub` provides high level application-logic as simple table.