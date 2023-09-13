import { GET_TOKEN, HAS_INTERNET_CONNECTION } from './helpers/helpers.js';
import { SignInController } from './controller/signedOut/signInController.js';
import { initApp, initOffline } from './config/init.js';

export const viewDOMElement = document.querySelector('#view');
export const headerDOMElement = document.querySelector('#header');
export const popupDOMElement = document.querySelector('#popup');
export const errorDOMElement = document.querySelector('#error');

let isLoggedIn = false;

if (GET_TOKEN()) {
    isLoggedIn = true;
}

if (HAS_INTERNET_CONNECTION()) {
    if (isLoggedIn === true) {
        initApp();
    } else {
        const signInController = new SignInController();
        signInController.setView();
    }
 } 
else {
    initOffline();
 }