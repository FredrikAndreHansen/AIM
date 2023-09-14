import { SignedOutController } from "../signedOutController.js";

export class RegisterController extends SignedOutController {

    constructor(registerModel) {
        super(registerModel);
    }

    setView() {
        this._loadDependencies.displayLoading();
        
        this.#generateOutput();
        
        this.#register();

        this._navigateToSignInPage();

        this._navigateToPasswordResetPage();

        this._loadDependencies.removeLoading();
    }

    #generateOutput() {
        return this._helpers.SET_INNER_HTML_VALUE({set: this._views.viewDOMElement, to: this._views.registerView});
    }

    #register() {
        const registerButtonNavigateDOMElement = document.querySelector('#register-button-navigate');
        const nameDOMElement = document.querySelector('#name');
        const emailDOMElement = document.querySelector('#email');
        const companyDOMElement = document.querySelector('#company');
        const passwordDOMElement = document.querySelector('#password');
        const confirmPasswordDOMElement = document.querySelector('#confirm-password');

        registerButtonNavigateDOMElement.addEventListener('click', (e) => {
            e.preventDefault();

            const userInputValues = {
                name: this._helpers.GET_DOM_VALUE(nameDOMElement),
                email: this._helpers.GET_DOM_VALUE(emailDOMElement),
                company: this._helpers.GET_DOM_VALUE(companyDOMElement),
                password: this._helpers.GET_DOM_VALUE(passwordDOMElement),
                confirmPassword: this._helpers.GET_DOM_VALUE(confirmPasswordDOMElement)
            };

            if (this._helpers.VALIDATE_USER_INPUT(userInputValues)) {
                this.registerModel.registerUser(userInputValues);
            }
        });
    }

}