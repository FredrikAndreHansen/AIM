import { viewDOMElement } from '../index.js';
import { registerView } from "../view/registerView.js";
import { RegisterModel } from "../model/registerModel.js";
import { SignInController } from './signInController.js'
import { PasswordResetController } from './passwordResetController.js';
import { LoadController } from './loadController.js';

export class RegisterController {

    setViewRegister() {
        // Initialize classes
        const loadController = new LoadController();
        loadController.displayLoading();
        const registerModel = new RegisterModel();
        const signInController = new SignInController();
        const passwordResetController = new PasswordResetController();

        // Set view & select DOM elements
        viewDOMElement.innerHTML = registerView;
        //viewDOMElement.style.overflow = "hidden";
        const registerButtonNavigateDOMElement = document.querySelector('#register-button-navigate');
        const signInNavigateDOMElement = document.querySelector('#sign-in-navigate');
        const passwordResetNavigateDOMElement = document.querySelector('#password-reset-navigate');
        const nameDOMElement = document.querySelector('#name');
        const emailDOMElement = document.querySelector('#email');
        const companyDOMElement = document.querySelector('#company');
        const passwordDOMElement = document.querySelector('#password');
        const confirmPasswordDOMElement = document.querySelector('#confirm-password');

        // Register user
        registerButtonNavigateDOMElement.addEventListener('click', function(e) {
            e.preventDefault();
            registerModel.isUserInputValid(nameDOMElement.value, emailDOMElement.value, companyDOMElement.value, passwordDOMElement.value, confirmPasswordDOMElement.value);
        });

        // Go to sign in section
        signInNavigateDOMElement.addEventListener('click', function() {
            signInController.setViewSignIn();
        });

        // Go to password reset section
        passwordResetNavigateDOMElement.addEventListener('click', function() {
            passwordResetController.setViewPasswordReset();
        });

        loadController.removeLoading();
    }

}