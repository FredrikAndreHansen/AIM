import { signInView } from "../view/signInView.js";
import { headerView } from "../view/headerView.js";
import { setViewRegister } from './registerController.js';
import { setViewPasswordReset } from './passwordResetController.js';
import { displayLoading, removeLoading } from './loadController.js';
import { isUserInputValid } from '../model/signInModel.js';
import { viewDOMElement } from '../index.js';
import { headerDOMElement } from "../index.js";

export function setViewSignIn() {
    displayLoading();
    // Set view & select DOM elements
    viewDOMElement.innerHTML = signInView;
    headerDOMElement.innerHTML = headerView(false);
    const registerNavigateDOMElement = document.querySelector('#register-navigate');
    const passwordResetNavigateDOMElement = document.querySelector('#password-reset-navigate');
    const signInButtonNavigateDOMElement = document.querySelector('#sign-in-button-navigate');
    const emailDOMElement = document.querySelector('#email');
    const passwordDOMElement = document.querySelector('#password');

    // Sign in user
    signInButtonNavigateDOMElement.addEventListener('click', function(e) {
        e.preventDefault();
        isUserInputValid(emailDOMElement.value, passwordDOMElement.value);
    });

    // Go to register section
    registerNavigateDOMElement.addEventListener('click', function() {
        setViewRegister();
    });

    // Go to password reset section
    passwordResetNavigateDOMElement.addEventListener('click', function() {
        setViewPasswordReset();
    });

    removeLoading();
}