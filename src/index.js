import { GET_AUTH, GET_TOKEN, HAS_INTERNET_CONNECTION, IS_OFFLINE } from './helpers/helpers.js';
import { AuthHelper } from './helpers/auth.js';
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

const authHelper = new AuthHelper();
authHelper.validateIfLoggedIn();

if (GET_TOKEN()) {
    isLoggedIn = true;
    //GET_AUTH.signInWithEmailAndPassword("joppla@email.com", "123456").then((_) => {});
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

// TODO:
// Check for the bug when you loose connection and re-connect again!

//chrome.runtime.reload();

// export function HAS_INTERNET_CONNECTION2() {
//     const getConnectionStatus = GET_DB_REFERENCE(".info/connected");
//     getConnectionStatus.on("value", (isConnected) => {
//         if (GET_VALUE(isConnected) === true) {
//             return true;
//         } else {
//             return false;
//         }
//     });
// }