import { viewDOMElement, headerDOMElement } from "../index.js";
import { signInView } from "../view/signedOut/signInView.js";
import { registerView } from "../view/signedOut/registerView.js";
import { passwordResetView } from "../view/signedOut/passwordResetView.js";
import { headerView } from "../view/handlers/headerView.js";
import { SignInModel } from "../model/signedOut/signInModel.js";
import { RegisterModel } from "../model/signedOut/registerModel.js";
import { PasswordResetModel } from "../model/signedOut/passwordResetModel.js";
import { createToken } from "../helpers/auth.js";
import { displayMessage } from "../libraries/handler.js";
import { initSignedOut } from "../libraries/init.js";
import { displayLoading, removeLoading } from "../libraries/load.js";
import { FORMAT_ERROR_MESSAGE, GET_AUTH, VALIDATE_USER_INPUT, SET_INNER_HTML_VALUE, GET_DOM_VALUE, GET_DB_REFERENCE, USERS_REF, CLEAR_DOM_VALUE } from "../helpers/helpers.js";

export class SignedOutController {

    _views = { viewDOMElement, headerDOMElement, signInView, registerView, headerView, passwordResetView };
    _loadDependencies = { displayLoading, removeLoading };
    _handlerDependencies = { displayMessage };
    _authDependencies = { createToken };
    _helpers = { FORMAT_ERROR_MESSAGE, GET_AUTH, VALIDATE_USER_INPUT, SET_INNER_HTML_VALUE, GET_DOM_VALUE, GET_DB_REFERENCE, USERS_REF, CLEAR_DOM_VALUE, initSignedOut };
    
    constructor(
        signInController, 
        registerController, 
        passwordResetController,
        signInModel = new SignInModel(this._handlerDependencies, this._authDependencies, this._helpers),
        registerModel = new RegisterModel(this._handlerDependencies, this._helpers, signInModel),
        passwordResetModel = new PasswordResetModel(this._handlerDependencies, this._helpers)
        ) {
            this.signInController = signInController;
            this.registerController = registerController;
            this.passwordResetController = passwordResetController;
            this.signInModel = signInModel;
            this.registerModel = registerModel;
            this.passwordResetModel = passwordResetModel;
    }

    init(navigate = false) {
        if (navigate === false) {this.signInController.setView();}
        if (navigate === 'register') {this.registerController.setView();}
        if (navigate === 'passwordReset') {this.passwordResetController.setView();}
    }

    _navigateToSignInPage() {
        const signInNavigateDOMElement = document.querySelector('#sign-in-navigate');

        signInNavigateDOMElement.addEventListener('click', () => {
            initSignedOut();
        });
    }

    _navigateToRegisterPage() {
        const registerNavigateDOMElement = document.querySelector('#register-navigate');

        registerNavigateDOMElement.addEventListener('click', () => {
            initSignedOut('register');
        });
    }

    _navigateToPasswordResetPage() {
        const passwordResetNavigateDOMElement = document.querySelector('#password-reset-navigate');

        passwordResetNavigateDOMElement.addEventListener('click', () => {
            initSignedOut('passwordReset');
        });
    }

}