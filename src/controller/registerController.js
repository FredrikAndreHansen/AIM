import { viewDOMElement } from '../index.js';
import { registerView } from "../view/registerView.js";
import { RegisterModel } from "../model/registerModel.js";
import { SignInController } from './signInController.js'
import { PasswordResetController } from './passwordResetController.js';
import { LoadController } from './loadController.js';
import { VALIDATE_USER_INPUT } from '../helpers/helpers.js';

export class RegisterController {

    setView() {
        const loadController = new LoadController();
        loadController.displayLoading();
        const registerModel = new RegisterModel();
        const signInController = new SignInController();
        const passwordResetController = new PasswordResetController();

        viewDOMElement.innerHTML = registerView;
        
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
            const userInputValues = {
                name: nameDOMElement.value,
                email: emailDOMElement.value,
                company: companyDOMElement.value,
                password: passwordDOMElement.value,
                confirmPassword: confirmPasswordDOMElement.value
            };

            if (VALIDATE_USER_INPUT(userInputValues)) {
                registerModel.registerUser(userInputValues);
            }
        });   

        // Go to sign in section
        signInNavigateDOMElement.addEventListener('click', function() {
            signInController.setView();
        });

        // Go to password reset section
        passwordResetNavigateDOMElement.addEventListener('click', function() {
            passwordResetController.setView();
        });

        loadController.removeLoading();
    }

}