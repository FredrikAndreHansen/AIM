import { GET_AUTH, GET_TOKEN } from './helpers/helpers.js';
import { SignInController } from './controller/signInController.js';
import { IndexController } from './controller/indexController.js';

export const viewDOMElement = document.querySelector('#view');
export const headerDOMElement = document.querySelector('#header');
export const popupDOMElement = document.querySelector('#popup');
let isLoggedIn = false;

// Check if user is logged in
if (GET_TOKEN()) {
    isLoggedIn = true;
    GET_AUTH.signInWithEmailAndPassword("", "").then((_) => {})
}

// Go to sign in if not logged in, or go to main if logged in
if (isLoggedIn === false) {
    const signInController = new SignInController();
    signInController.setView();
} else {
    const indexController = new IndexController();
    indexController.setView();
}