import { SignInController } from './controller/signInController.js';
import { IndexController } from './controller/indexController.js';

export const viewDOMElement = document.querySelector('#view');
export const headerDOMElement = document.querySelector('#header');
export const popupDOMElement = document.querySelector('#popup');
let isLoggedIn = false;

// Check if user is logged in
if (localStorage.getItem('AIMNomadToken')) {
    isLoggedIn = true;
}

// Go to sign in if not logged in, or go to main if logged in
if (isLoggedIn === false) {
    const signInController = new SignInController();
    signInController.setViewSignIn();
} else {
    const indexController = new IndexController();
    indexController.setViewIndex();
}