import { viewDOMElement } from '../../index.js';
import { passwordResetView } from '../../view/signedOut/passwordResetView.js';
import { PasswordResetModel } from "../../model/passwordResetModel.js";
import { NavigateController } from '../handlers/navigateController.js';
import { LoadController } from '../handlers/loadController.js';
import { VALIDATE_USER_INPUT, GET_DOM_VALUE, CLEAR_DOM_VALUE, SET_INNER_HTML_VALUE } from '../../helpers/helpers.js';

export class PasswordResetController {

    setView() {
        const loadController = new LoadController();
        loadController.displayLoading();

        this.#generateOutput();

        this.#resetPassword();

        const navigateController = new NavigateController();
        navigateController.navigateToSignInPage();
        navigateController.navigateToRegisterPage();

        loadController.removeLoading();
    }

    #generateOutput() {
        return SET_INNER_HTML_VALUE({set: viewDOMElement, to: passwordResetView});
    }

    #resetPassword() {
        const passwordResetModel = new PasswordResetModel();

        const passwordResetButton = document.querySelector('#password-reset-button');
        const emailDOMElement = document.querySelector('#email');

        passwordResetButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (VALIDATE_USER_INPUT({ email: GET_DOM_VALUE(emailDOMElement) })) {
                passwordResetModel.resetPassword(GET_DOM_VALUE(emailDOMElement));
            }
            
            CLEAR_DOM_VALUE(emailDOMElement);
        });
    }

}