import { setViewSignIn } from './controller/signInController.js';
import { setViewIndex } from './controller/indexController.js';

export const viewDOMElement = document.querySelector('#view');
export const headerDOMElement = document.querySelector('#header');
let isLoggedIn = false;

// Check if user is logged in
if (localStorage.getItem('AIMNomadToken')) {
    isLoggedIn = true;
}

// Go to sign in if not logged in, or go to main if logged in
if (isLoggedIn === false) {
    setViewSignIn();
} else {
    setViewIndex();
}