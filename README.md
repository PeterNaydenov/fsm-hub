# Fsm-hub (@peter.naydenov/fsm-hub)

Did you have tried `Fsm (@peter.naydenov/fsm)` yet? **Fsm-hub** is an extension that can connect all existing  `Fsm` instances in the application and make them reactive by using `Fsm-hub` as communication chanel. Every `fsm relation` is described as row in a table:

```js
 
table : [
           [ 'One', 'newState', 'Two' , 'reaction' ]
           // ... more rows like this
        ]
```

Read this row like "When fsm 'One' changes its state to 'newState', then fsm 'Two' will trigger own update action - 'reaction'".

`Fsm-hub` provides high level application-logic as simple table.