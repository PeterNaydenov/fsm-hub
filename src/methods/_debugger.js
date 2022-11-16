function  _debugger ( hub ) {
return function ( str, data ) {
    if ( hub.debug )   console.log ( str, data )
}} // debugger func.



export default _debugger


