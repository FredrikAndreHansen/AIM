import { viewDOMElement } from '../index.js';
import { indexView } from '../view/indexView.js';
import { LoadController } from './loadController.js';
import { HeaderController } from './headerController.js';
import { UsersModel } from '../model/usersModel.js';
import { EncryptHelper } from '../helpers/encrypt.js';
import { SALT, TRIMSTRING, PARSESTRING } from '../helpers/helpers.js';

export class IndexController {

    setViewIndex() {
        // Initialize classes
        const loadController = new LoadController();
        loadController.displayLoading();
        const headerController = new HeaderController();
        const usersModel = new UsersModel();
        const encryptHelper = new EncryptHelper();

        headerController.setViewHeader();

        const mainMenuLogoDOMElement = document.querySelector('#main-menu-logo');
        mainMenuLogoDOMElement.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';

        // Validate and parse localstorage
        const token = PARSESTRING(localStorage.getItem('AIMNomadToken'));
        const [userId, _, __] = token.split(',');
        
        const userIdTrim = TRIMSTRING(userId);

        SALT().then((salt) => {
            // Decrypt the userId
            const decryptId = encryptHelper.decipher(salt);
            const decryptedUserId = decryptId(userIdTrim);
            
            usersModel.fetchUserInfo(decryptedUserId).then(res => {
                const setIndexView = indexView(res[0], res[1]);
                viewDOMElement.innerHTML = setIndexView;
            });
        });
    }

}