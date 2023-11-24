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

                const listenForUpdates = this._authDependencies.listenForUpdates(decryptedUserId);
                listenForUpdates.on('value', () => {
                    this.#getInvitedUsers();
                });
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

                this.#acceptTeamInvitation();
                this.#declineTeamInvitation();
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

    #acceptTeamInvitation() {
        const acceptBtnDOMElement = document.querySelectorAll('#accept-button');

        acceptBtnDOMElement.forEach((element) => {
            const idsArray = this._helpers.CONVERT_STRING_TO_ARRAY(element.getAttribute('data-id'));

            element.addEventListener('click', () => {
                this.indexModel.acceptTeamInvitation({
                    teamId: idsArray[0],
                    invitedId: idsArray[1]
                });
                this._helpers.initApp();
            });
        });
    }

    #declineTeamInvitation() {
        const declineBtnDOMElement = document.querySelectorAll('#decline-button');

        declineBtnDOMElement.forEach((element) => {
            const idsArray = this._helpers.CONVERT_STRING_TO_ARRAY(element.getAttribute('data-id'));
            
            element.addEventListener('click', () => {
                this.indexModel.removeTeamInvitation({
                    teamId: idsArray[0],
                    invitedId: idsArray[1]
                });
                this._helpers.initApp();
            });
        });
    }

    #indexMenuHighlight() {
        const mainMenuLogoDOMElement = document.querySelector('#main-menu-logo');
        this._helpers.SET_MENU_HIGHLIGHT(mainMenuLogoDOMElement);
    }

}