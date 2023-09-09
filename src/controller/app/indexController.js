import { viewDOMElement } from '../../index.js';
import { indexView } from '../../view/app/indexView.js';
import { LoadController } from '../handlers/loadController.js';
import { NavigateController } from '../handlers/navigateController.js';
import { UsersModel } from '../../model/usersModel.js';
import { EncryptHelper } from '../../helpers/encrypt.js';
import { SALT, TRIMSTRING, PARSESTRING, GET_TOKEN, SET_INNER_HTML_VALUE, SET_MENU_HIGHLIGHT } from '../../helpers/helpers.js';

export class IndexController {

    setView() {
        const loadController = new LoadController();
        loadController.displayLoading();

        const navigateController = new NavigateController();
        navigateController.setView();

        this.#generateOutput();

        this.#indexMenuHighlight();
    }

    #generateOutput() {
        const usersModel = new UsersModel();
        const encryptHelper = new EncryptHelper();

        const token = PARSESTRING(GET_TOKEN());
        const [userId, _, __] = token.split(',');
        
        const userIdTrim = TRIMSTRING(userId);

        SALT().then((salt) => {
            const decryptId = encryptHelper.decipher(salt);
            const decryptedUserId = decryptId(userIdTrim);
            
            usersModel.fetchUserInfo(decryptedUserId).then(res => {
                const setIndexView = indexView({
                    userName: res[0], 
                    company: res[1]
                });

                SET_INNER_HTML_VALUE({set: viewDOMElement, to: setIndexView});
            });
        });
    }

    #indexMenuHighlight() {
        const mainMenuLogoDOMElement = document.querySelector('#main-menu-logo');
        SET_MENU_HIGHLIGHT(mainMenuLogoDOMElement);
    }

}