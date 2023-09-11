import { viewDOMElement, headerDOMElement } from '../../index.js';
import { signInView } from "../../view/signedOut/signInView.js"
import { headerView } from '../../view/handlers/headerView.js';
import { NavigateController } from '../handlers/navigateController.js';
import { LoadController } from '../handlers/loadController.js';
import { SignInModel } from '../../model/signedOut/signInModel.js';
import { VALIDATE_USER_INPUT, SET_INNER_HTML_VALUE, GET_DOM_VALUE } from '../../helpers/helpers.js';

export class SignInController {

    setView() {
        const loadController = new LoadController();
        loadController.displayLoading();
    
        this.#generateOutput();

        this.#generateHeaderOutput();

        this.#signIn();

        const navigateController = new NavigateController();
        navigateController.navigateToRegisterPage();
        navigateController.navigateToPasswordResetPage();

        loadController.removeLoading();
    }

    #generateOutput() {
        return SET_INNER_HTML_VALUE({set: viewDOMElement, to: signInView});
    }

    #generateHeaderOutput() {
        return SET_INNER_HTML_VALUE({set: headerDOMElement, to: headerView(false)});
    }

    #signIn() {
        const signInModel = new SignInModel();

        const signInButtonNavigateDOMElement = document.querySelector('#sign-in-button-navigate');
        const emailDOMElement = document.querySelector('#email');
        const passwordDOMElement = document.querySelector('#password');

        signInButtonNavigateDOMElement.addEventListener('click', function(e) {
            e.preventDefault();
            const email = GET_DOM_VALUE(emailDOMElement);
            const password = GET_DOM_VALUE(passwordDOMElement);

            if (VALIDATE_USER_INPUT({ email: email, password: password })) {
                signInModel.signInUser(email, password);
            }
        });
    }

}