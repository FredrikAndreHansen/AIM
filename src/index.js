import { setViewRegister } from './controller/registerController.js';
import { setViewSignIn } from './controller/signInController.js';

export const viewDOMElement = document.querySelector('#view');

// Sign In View
setViewSignIn();