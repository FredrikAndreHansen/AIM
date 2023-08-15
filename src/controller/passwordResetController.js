import { passwordResetView } from '../view/passwordResetView.js';
import { isEmailValid } from '../model/passwordResetModel.js';
import { setViewSignIn } from './signInController.js'
import { setViewRegister } from './registerController.js';
import { displayLoading, removeLoading } from './loadController.js';
import { viewDOMElement } from '../index.js';

export function setViewPasswordReset() {
    displayLoading();
    // Set view & select DOM elements
    viewDOMElement.innerHTML = passwordResetView;
    const signInNavigateDOMElement = document.querySelector('#sign-in-navigate');
    const registerNavigateDOMElement = document.querySelector('#register-navigate');
    const passwordResetButton = document.querySelector('#password-reset-button');
    const emailDOMElement = document.querySelector('#email');

    // Reset password
    passwordResetButton.addEventListener('click', function(e) {
        e.preventDefault();
        isEmailValid(emailDOMElement.value);
        emailDOMElement.value = '';
    });

    // Go to sign in section
    signInNavigateDOMElement.addEventListener('click', function() {
        setViewSignIn();
    });

    // Go to register section
    registerNavigateDOMElement.addEventListener('click', function() {
        setViewRegister();
    });

    removeLoading();
}