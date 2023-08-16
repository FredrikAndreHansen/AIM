import { userView } from '../view/userView.js';
import { displayLoading, removeLoading } from './loadController.js';
import { setViewHeader } from './headerController.js';
import { fetchAllUsers } from '../helpers/userData.js';
import { viewDOMElement } from '../index.js';

export function setViewUsers() {
    displayLoading();

    setViewHeader();

    const mainMenuUsersDOMElement = document.querySelector('#main-menu-users');
    mainMenuUsersDOMElement.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';

    viewDOMElement.innerHTML = userView();

    fetchAllUsers().then(res => {
        const userListDOMElement = document.querySelector('#user-list');
        userListDOMElement.innerHTML = res;
    });

    removeLoading();
}