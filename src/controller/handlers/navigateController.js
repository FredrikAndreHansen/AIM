import { headerDOMElement } from '../../index.js';
import { headerView } from '../../view/handlers/headerView.js';
import { LoadController } from './loadController.js';
import { SignInController } from '../signedOut/signInController.js';
import { RegisterController } from '../signedOut/registerController.js';
import { PasswordResetController } from '../signedOut/passwordResetController.js';
import { UsersController } from '../app/usersController.js';
import { TeamsController } from '../app/teamsController.js';
import { IndexController } from '../app/indexController.js';
import { AuthHelper } from '../../helpers/auth.js';
import { SET_INNER_HTML_VALUE } from '../../helpers/helpers.js';

export class NavigateController {

    setView() { 
        const authHelper = new AuthHelper();
        authHelper.validateIfLoggedIn();

        this.#generateOutput();
        
        this.#navigateToIndexPage();

        this.#navigateToUsersPage();

        this.#navigateToTeamsPage();

        this.#logOut();
    }

    #generateOutput() {
        return SET_INNER_HTML_VALUE({set: headerDOMElement, to: headerView(true)});
    }

    #navigateToIndexPage() {
        const indexController = new IndexController();

        const mainMenuLogoDOMElement = document.querySelector('#main-menu-logo');

         mainMenuLogoDOMElement.addEventListener('click', function() {
            indexController.setView();
        }); 
    }

    #navigateToUsersPage() {
        const usersController = new UsersController();

        const mainMenuUsersDOMElement = document.querySelector('#main-menu-users');

        mainMenuUsersDOMElement.addEventListener('click', function() {
            usersController.setView();
        });
    }

    #navigateToTeamsPage() {
        const teamsController = new TeamsController();

        const mainMenuTeamsDOMElement = document.querySelector('#main-menu-teams');

        mainMenuTeamsDOMElement.addEventListener('click', function() {
            teamsController.setView();
        });
    }

    #logOut() {
        const loadController = new LoadController();

        const mainMenuSignOutDOMElement = document.querySelector('#main-menu-sign-out');

        mainMenuSignOutDOMElement.addEventListener('click', function() {
            loadController.displayLoading();
            const authHelper = new AuthHelper();
            authHelper.removeToken();
        });
    }

    navigateToSignInPage() {
        const signInController = new SignInController();

        const signInNavigateDOMElement = document.querySelector('#sign-in-navigate');

        signInNavigateDOMElement.addEventListener('click', function() {
            signInController.setView();
        });
    }

    navigateToRegisterPage() {
        const registerController = new RegisterController();
        
        const registerNavigateDOMElement = document.querySelector('#register-navigate');

        registerNavigateDOMElement.addEventListener('click', function() {
            registerController.setView();
        });
    }

    navigateToPasswordResetPage() {
        const passwordResetController = new PasswordResetController();

        const passwordResetNavigateDOMElement = document.querySelector('#password-reset-navigate');

        passwordResetNavigateDOMElement.addEventListener('click', function() {
            passwordResetController.setView();
        });
    }

}