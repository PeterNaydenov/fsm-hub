import _setTransitions from './_setTransitions.js';
import _debugger from './_debugger.js';
import _callback from './_callback.js';
import _schedule from './_schedule.js';
import addFsm from './addFsm.js';
import addFunctions from './addFunctions.js';
/**
 * Method factories. The constructor calls each one once per hub; the result is
 * a method that works on that hub.
 * @type {{
 *   _setTransitions: typeof _setTransitions,
 *   _debugger: typeof _debugger,
 *   _callback: typeof _callback,
 *   _schedule: typeof _schedule,
 *   addFsm: typeof addFsm,
 *   addFunctions: typeof addFunctions
 * }}
 */
declare const fn: {
    _setTransitions: typeof _setTransitions;
    _debugger: typeof _debugger;
    _callback: typeof _callback;
    _schedule: typeof _schedule;
    addFsm: typeof addFsm;
    addFunctions: typeof addFunctions;
};
export default fn;
