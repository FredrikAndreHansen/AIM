import { viewDOMElement } from '../index.js';
import { passwordResetView } from '../view/passwordResetView.js';
import { PasswordResetModel } from '../model/passwordResetModel.js';
import { SignInController } from './signInController.js'
import { RegisterController } from './registerController.js';
import { LoadController } from './loadController.js';
import { VALIDATE_USER_INPUT } from '../helpers/helpers.js';

export class PasswordResetController {

    setViewPasswordReset() {
        const loadController = new LoadController();
        loadController.displayLoading();
        const passwordResetModel = new PasswordResetModel();
        const signInController = new SignInController();
        const registerController = new RegisterController();

        // Set view & select DOM elements
        viewDOMElement.innerHTML = passwordResetView;
        const signInNavigateDOMElement = document.querySelector('#sign-in-navigate');
        const registerNavigateDOMElement = document.querySelector('#register-navigate');
        const passwordResetButton = document.querySelector('#password-reset-button');
        const emailDOMElement = document.querySelector('#email');

        // Reset password
        passwordResetButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (VALIDATE_USER_INPUT({email: emailDOMElement.value})) {
                passwordResetModel.resetPassword(emailDOMElement.value);
            }
            
            emailDOMElement.value = '';
        });

        // Go to sign in section
        signInNavigateDOMElement.addEventListener('click', function() {
            signInController.setViewSignIn();
        });

        // Go to register section
        registerNavigateDOMElement.addEventListener('click', function() {
            registerController.setViewRegister();
        });

        loadController.removeLoading();
    }

}