import { registerView } from "../view/registerView.js";
import { isUserInputValid } from "../model/registerModel.js";
import { setViewSignIn } from './signInController.js'
import { setViewPasswordReset } from './passwordResetController.js';
import { displayLoading, removeLoading } from './loadController.js';
import { viewDOMElement } from '../index.js';

export function setViewRegister() {
    displayLoading();
    // Set view & select DOM elements
    viewDOMElement.innerHTML = registerView;
    const registerButtonNavigateDOMElement = document.querySelector('#register-button-navigate');
    const signInNavigateDOMElement = document.querySelector('#sign-in-navigate');
    const passwordResetNavigateDOMElement = document.querySelector('#password-reset-navigate');
    const nameDOMElement = document.querySelector('#name');
    const emailDOMElement = document.querySelector('#email');
    const passwordDOMElement = document.querySelector('#password');
    const confirmPasswordDOMElement = document.querySelector('#confirm-password');

    // Register user
    registerButtonNavigateDOMElement.addEventListener('click', function(e) {
        e.preventDefault();
        isUserInputValid(nameDOMElement.value, emailDOMElement.value, passwordDOMElement.value, confirmPasswordDOMElement.value);
    });

    // Go to sign in section
    signInNavigateDOMElement.addEventListener('click', function() {
        setViewSignIn();
    });

    // Go to password reset section
    passwordResetNavigateDOMElement.addEventListener('click', function() {
        setViewPasswordReset();
    });

    removeLoading();
}