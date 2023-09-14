import { SignInController } from "./signInController.js";

export class PasswordResetController extends SignInController {

    constructor(passwordResetModel) {
        super(passwordResetModel);
    }

    setView() {
        this._loadDependencies.displayLoading();

        this.#generateOutput();

        this.#resetPassword();

        this._navigateToSignInPage();

        this._navigateToRegisterPage();

        this._loadDependencies.removeLoading();
    }

    #generateOutput() {
        return this._helpers.SET_INNER_HTML_VALUE({set: this._views.viewDOMElement, to: this._views.passwordResetView});
    }

    #resetPassword() {
        const passwordResetButton = document.querySelector('#password-reset-button');
        const emailDOMElement = document.querySelector('#email');

        passwordResetButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (this._helpers.VALIDATE_USER_INPUT({ email: this._helpers.GET_DOM_VALUE(emailDOMElement) })) {
                this.passwordResetModel.resetPassword(this._helpers.GET_DOM_VALUE(emailDOMElement));
            }
            
            this._helpers.CLEAR_DOM_VALUE(emailDOMElement);
        });
    }

}