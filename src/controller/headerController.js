import { headerDOMElement } from '../index.js';
import { headerView } from '../view/headerView.js';
import { LoadController } from './loadController.js';
import { UsersController } from './usersController.js';
import { IndexController } from './indexController.js';
import { AuthHelper } from '../helpers/auth.js';

export class HeaderController {

    setViewHeader() {
        const authHelper = new AuthHelper();
        const usersController = new UsersController();
        const loadController = new LoadController();
        const indexController = new IndexController();

        authHelper.validateIfLoggedIn();

        // Set the header
        headerDOMElement.innerHTML = headerView(true);
        const mainMenuLogoDOMElement = document.querySelector('#main-menu-logo');
        const mainMenuSignOutDOMElement = document.querySelector('#main-menu-sign-out');
        const mainMenuUsersDOMElement = document.querySelector('#main-menu-users');

        // Index
        mainMenuLogoDOMElement.addEventListener('click', function() {
            indexController.setViewIndex();
        });

        // Manage Users
        mainMenuUsersDOMElement.addEventListener('click', function() {
            usersController.setViewUsers();
        });

        // Log out
        mainMenuSignOutDOMElement.addEventListener('click', function() {
            loadController.displayLoading();
            authHelper.removeToken();
        });
    }

}