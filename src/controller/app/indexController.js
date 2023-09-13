import { viewDOMElement } from '../../index.js';
import { indexView } from '../../view/app/indexView.js';
import { AppController } from '../appController.js';
import { SALT, TRIMSTRING, PARSESTRING, GET_TOKEN, SET_INNER_HTML_VALUE, SET_MENU_HIGHLIGHT } from '../../helpers/helpers.js';

export class IndexController extends AppController {

    constructor(individualUserModel) {
        super(individualUserModel);
    }

    setView() {
        this.#generateOutput();

        this.#indexMenuHighlight();
    }

    #generateOutput() {
        const token = PARSESTRING(GET_TOKEN());
        const [userId, _, __] = token.split(',');
        
        const userIdTrim = TRIMSTRING(userId);

        SALT().then((salt) => {
            const decryptId = this.encryptHelper.decipher(salt);
            const decryptedUserId = decryptId(userIdTrim);
            
            this.individualUserModel.getIndividualUser(decryptedUserId).then(res => {
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