import { GET_TOKEN, HAS_INTERNET_CONNECTION, IS_OFFLINE } from './helpers/helpers.js';
import { LoadController } from './controller/handlers/loadController.js';
import { SignInController } from './controller/signedOut/signInController.js';
import { IndexController } from './controller/app/indexController.js';

export const viewDOMElement = document.querySelector('#view');
export const headerDOMElement = document.querySelector('#header');
export const popupDOMElement = document.querySelector('#popup');
export const errorDOMElement = document.querySelector('#error');

const loadController = new LoadController();
loadController.displayLoading();

let isLoggedIn = false;

if (GET_TOKEN()) {
    isLoggedIn = true;
}

if (HAS_INTERNET_CONNECTION()) {
    if (isLoggedIn === true) {
        const indexController = new IndexController();
        indexController.setView();
    } else {
        const signInController = new SignInController();
        signInController.setView();
    }
 } 
else {
     IS_OFFLINE();
 }