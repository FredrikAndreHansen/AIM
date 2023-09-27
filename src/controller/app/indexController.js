import { AppController } from '../appController.js';

export class IndexController extends AppController {

    constructor(indexModel, individualUserModel) {
        super(indexModel, individualUserModel);
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

                this.#getInvitedUsers();
            });
        });
    }

    #getInvitedUsers() {
        this.indexModel.checkForTeamInvites().then(res => {
            const content = res[0];
            const contentQuantity = res[1];

            if (contentQuantity > 0) {
                this.#setAlerts(true);

                const invitedUsersDOMElement = document.querySelector('#invited-users');
                this._helpers.SET_INNER_HTML_VALUE({set: invitedUsersDOMElement, to: content});

                const allInvitedTeamsDOMElement = document.querySelectorAll('#all-invited-teams');
                this._helpers.ANIMATE_FADE_IN(allInvitedTeamsDOMElement);
            } else {
                this.#setAlerts(false);
            }
        });
    }

    #setAlerts(isAlert) {
        const alertsDOMElement = document.querySelector('#alerts');
        if (isAlert === true) {
            this._helpers.SET_INNER_HTML_VALUE({set: alertsDOMElement, to: ''});
        } else {
            this._helpers.SET_INNER_HTML_VALUE({set: alertsDOMElement, to: this._views.noAlertsView()});
        }
    }

    #indexMenuHighlight() {
        const mainMenuLogoDOMElement = document.querySelector('#main-menu-logo');
        this._helpers.SET_MENU_HIGHLIGHT(mainMenuLogoDOMElement);
    }

}