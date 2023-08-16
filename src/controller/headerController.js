import { headerView } from '../view/headerView.js';
import { displayLoading } from './loadController.js';
import { setViewUsers } from './usersController.js';
import { setViewIndex } from './indexController.js';
import { removeToken } from '../helpers/userToken.js';
import { headerDOMElement } from '../index.js';

export function setViewHeader() {

    // Set the header
    headerDOMElement.innerHTML = headerView(true);
    const mainMenuLogoDOMElement = document.querySelector('#main-menu-logo');
    const mainMenuSignOutDOMElement = document.querySelector('#main-menu-sign-out');
    const mainMenuUsersDOMElement = document.querySelector('#main-menu-users');

    // Index
    mainMenuLogoDOMElement.addEventListener('click', function() {
        setViewIndex();
    });

    // Manage Users
    mainMenuUsersDOMElement.addEventListener('click', function() {
        setViewUsers();
    });

    // Log out
    mainMenuSignOutDOMElement.addEventListener('click', function() {
        displayLoading();
        removeToken();
    });
}