import { indexView } from '../view/indexView.js';
import { displayLoading, removeLoading } from './loadController.js';
import { setViewHeader } from './headerController.js';
import { fetchUserInfo } from '../helpers/userData.js';
import { viewDOMElement } from '../index.js';

export function setViewIndex() {
    displayLoading();

    setViewHeader();

    const mainMenuLogoDOMElement = document.querySelector('#main-menu-logo');
    mainMenuLogoDOMElement.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';

    fetchUserInfo().then(res => {
        const setIndexView = indexView(res[0], res[1]);
        viewDOMElement.innerHTML = setIndexView;
    });

    removeLoading();
}