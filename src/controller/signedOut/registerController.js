import { viewDOMElement } from '../../index.js';
import { registerView } from "../../view/signedOut/registerView.js";
import { RegisterModel } from "../../model/registerModel.js";
import { NavigateController } from '../handlers/navigateController.js';
import { LoadController } from '../handlers/loadController.js';
import { VALIDATE_USER_INPUT, GET_DOM_VALUE, SET_INNER_HTML_VALUE } from '../../helpers/helpers.js';

export class RegisterController {

    setView() {
        const loadController = new LoadController();
        loadController.displayLoading();
        
        this.#generateOutput();
        
        this.#register();

        const navigateController = new NavigateController();
        navigateController.navigateToSignInPage();
        navigateController.navigateToPasswordResetPage();

        loadController.removeLoading();
    }

    #generateOutput() {
        return SET_INNER_HTML_VALUE({set: viewDOMElement, to: registerView});
    }

    #register() {
        const registerModel = new RegisterModel();

        const registerButtonNavigateDOMElement = document.querySelector('#register-button-navigate');
        const nameDOMElement = document.querySelector('#name');
        const emailDOMElement = document.querySelector('#email');
        const companyDOMElement = document.querySelector('#company');
        const passwordDOMElement = document.querySelector('#password');
        const confirmPasswordDOMElement = document.querySelector('#confirm-password');

        registerButtonNavigateDOMElement.addEventListener('click', function(e) {
            e.preventDefault();

            const userInputValues = {
                name: GET_DOM_VALUE(nameDOMElement),
                email: GET_DOM_VALUE(emailDOMElement),
                company: GET_DOM_VALUE(companyDOMElement),
                password: GET_DOM_VALUE(passwordDOMElement),
                confirmPassword: GET_DOM_VALUE(confirmPasswordDOMElement)
            };

            if (VALIDATE_USER_INPUT(userInputValues)) {
                registerModel.registerUser(userInputValues);
            }
        });
    }

}