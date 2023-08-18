import { viewDOMElement } from '../index.js';
import { indexView } from '../view/indexView.js';
import { LoadController } from './loadController.js';
import { HeaderController } from './headerController.js';
import { UsersModel } from '../model/usersModel.js';

export class IndexController {

    setViewIndex() {
        // Initialize classes
        const loadController = new LoadController();
        loadController.displayLoading();
        const headerController = new HeaderController();
        const usersmodel = new UsersModel();

        headerController.setViewHeader();

        const mainMenuLogoDOMElement = document.querySelector('#main-menu-logo');
        mainMenuLogoDOMElement.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';

        const userId = localStorage.getItem('AIMNomadToken');
        usersmodel.fetchUserInfo(userId).then(res => {
            const setIndexView = indexView(res[0], res[1]);
            viewDOMElement.innerHTML = setIndexView;
        });

        loadController.removeLoading();
    }

}