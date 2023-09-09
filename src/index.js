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