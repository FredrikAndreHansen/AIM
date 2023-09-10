import { GET_AUTH, GET_TOKEN } from './helpers/helpers.js';
import { SignInController } from './controller/signedOut/signInController.js';
import { IndexController } from './controller/app/indexController.js';

export const viewDOMElement = document.querySelector('#view');
export const headerDOMElement = document.querySelector('#header');
export const popupDOMElement = document.querySelector('#popup');

let isLoggedIn = false;

if (GET_TOKEN()) {
    isLoggedIn = true;
    GET_AUTH.signInWithEmailAndPassword("", "").then((_) => {})
}

if (isLoggedIn === true) {
    const indexController = new IndexController();
    indexController.setView();
} else {
    const signInController = new SignInController();
    signInController.setView();
}

// TODO:
// Give the model folder a "signedOut" and a "app" folder!
// Make it so that you can click on the error/success message text without that the box dissapear, it should only dissapear if you click outside of the box or the close button!
// Have the users load in nicely!
// Make it so that when you click on a page you already are on that the page doesn't reload
// Check for the bug when you loose connection and re-connect again!