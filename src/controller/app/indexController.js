import { AppController } from '../appController.js';

export class IndexController extends AppController {

    constructor(individualUserModel) {
        super(individualUserModel);
    }

    setView() {
        this.#generateOutput();

        this.#indexMenuHighlight();
    }

    #generateOutput() {
        const token = this._helpers.PARSESTRING(this._helpers.GET_TOKEN());
        const [userId, _, __] = token.split(',');
        
        const userIdTrim = this._helpers.TRIMSTRING(userId);

        this._helpers.SALT().then((salt) => {
            const decryptId = this._encryptDependencies.decipher(salt);
            const decryptedUserId = decryptId(userIdTrim);
            
            this.individualUserModel.getIndividualUser(decryptedUserId).then(res => {
                const setIndexView = this._views.indexView({
                    userName: res[0], 
                    company: res[1]
                });

                this._helpers.SET_INNER_HTML_VALUE({set: this._views.viewDOMElement, to: setIndexView});
            });
        });
    }

    #indexMenuHighlight() {
        const mainMenuLogoDOMElement = document.querySelector('#main-menu-logo');
        this._helpers.SET_MENU_HIGHLIGHT(mainMenuLogoDOMElement);
    }

}