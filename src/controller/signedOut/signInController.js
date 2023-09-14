import { SignedOutController } from "../signedOutController.js";

export class SignInController extends SignedOutController {

    constructor(signInModel) {
        super(signInModel);
    }

    setView() {
        this._loadDependencies.displayLoading();
    
        this.#generateOutput();

        this.#generateHeaderOutput();

        this.#signIn();

        this._navigateToRegisterPage();

        this._navigateToPasswordResetPage();

        this._loadDependencies.removeLoading();
    }

    #generateOutput() {
        return this._helpers.SET_INNER_HTML_VALUE({set: this._views.viewDOMElement, to: this._views.signInView});
    }

    #generateHeaderOutput() {
        return this._helpers.SET_INNER_HTML_VALUE({set: this._views.headerDOMElement, to: this._views.headerView(false)});
    }

    #signIn() {
        const signInButtonNavigateDOMElement = document.querySelector('#sign-in-button-navigate');
        const emailDOMElement = document.querySelector('#email');
        const passwordDOMElement = document.querySelector('#password');

        signInButtonNavigateDOMElement.addEventListener('click', (e) => {
            e.preventDefault();
            const email = this._helpers.GET_DOM_VALUE(emailDOMElement);
            const password = this._helpers.GET_DOM_VALUE(passwordDOMElement);

            if (this._helpers.VALIDATE_USER_INPUT({ email: email, password: password })) {
                this.signInModel.signInUser(email, password);
            }
        });
    }

}