import { viewDOMElement, headerDOMElement } from '../index.js';
import { signInView } from "../view/signInView.js";
import { headerView } from "../view/headerView.js";
import { RegisterController } from './registerController.js';
import { PasswordResetController } from './passwordResetController.js';
import { LoadController } from './loadController.js';
import { SignInModel } from '../model/signInModel.js';

export class SignInController {

    setViewSignIn() {
        // Initialize classes
        const loadController = new LoadController();
        loadController.displayLoading();
        const signInModel = new SignInModel();
        const registerController = new RegisterController();
        const passwordResetController = new PasswordResetController();

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
            signInModel.isUserInputValid(emailDOMElement.value, passwordDOMElement.value);
        });

        // Go to register section
        registerNavigateDOMElement.addEventListener('click', function() {
            registerController.setViewRegister();
        });

        // Go to password reset section
        passwordResetNavigateDOMElement.addEventListener('click', function() {
            passwordResetController.setViewPasswordReset();
        });

        loadController.removeLoading();
    }

}