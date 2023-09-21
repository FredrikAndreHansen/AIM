import { AppController } from '../appController.js';

export class UsersController extends AppController {

    constructor(individualUserController, usersModel, individualUserModel) {
        super(individualUserController, usersModel, individualUserModel);
    }

    setView() {
        this.#usersMenuHighlight();

        this.usersModel.checkIfAnyUsersAreBlocked().then((hasBlockedUsers) => {
            this.#generateOutput(hasBlockedUsers);

            this.#displayUsers();

            this.#searchUsers();

            this.#filterByBlockedUsers(hasBlockedUsers);
        });
    }

    #generateOutput(hasBlockedUsers) {
        return this._helpers.SET_INNER_HTML_VALUE({set: this._views.viewDOMElement, to: this._views.usersView(hasBlockedUsers)});
    }

    #displayUsers(searchQuery = '', onlyDisplayBlockedUsers = false) {
        this.usersModel.getUsers(searchQuery, onlyDisplayBlockedUsers).then(res => {
            this.#outputAllUsers(res);

            this.#getIndividualUser();
        });
    }

    #outputAllUsers(userInfo) {
        const userListDOMElement = document.querySelector('#user-list');
        this._helpers.SET_INNER_HTML_VALUE({set: userListDOMElement, to: userInfo});

        const allUsersDOMElement = document.querySelectorAll("#all-users");
        this._helpers.ANIMATE_FADE_IN(allUsersDOMElement);
    }

    #getIndividualUser() {
        const allUsersDOMElement = document.querySelectorAll("#all-users");

        allUsersDOMElement.forEach((getIndividualUser) => {
            
            getIndividualUser.addEventListener('click', () => {
                
                this._loadDependencies.displayLoading();
                const userId = getIndividualUser.getAttribute('data-id');
                
                this._helpers.SALT().then((salt) => {
                    const decrypt = this._encryptDependencies.decipher(salt);
                    const decryptedId = decrypt(userId);
                    
                    this.individualUserModel.getIndividualUser(decryptedId).then(res => {
                        const userName = res[0];
                        const company = res[1];
                        const userIsBlocked = res[2];
                        this.individualUserController.setView(userId, userName, company, userIsBlocked);
                    });
                })
            })
        });
    }

    #searchUsers() {
        const searchUserDomElement = document.querySelector('#search-user');
        searchUserDomElement.addEventListener('input', () => {
            this.#getUsers(searchUserDomElement);
        });

        const btnCutLeftDomElement = document.querySelector('.btn-cut-left-blue');
        btnCutLeftDomElement.addEventListener('click', () => {
            this.#getUsers(searchUserDomElement);
        });
    }

    #getUsers(searchUserDomElement) {
        try {
            this.#displayUsers({
                searchQuery: this._helpers.GET_DOM_VALUE(searchUserDomElement), 
                onlyDisplayBlockedUsers: false
            });
        } catch(error) {
            this._handlerController.displayMessage({message: error, isError: true});
        }
    }

    #filterByBlockedUsers(hasBlockedUsers) {
        if (hasBlockedUsers === false) {
            return;
        }

        const hasBlockedUsersBtnDOMElement = document.querySelector('#has-blocked-users-button');
        hasBlockedUsersBtnDOMElement.addEventListener('click', () => {
            this.#displayUsers({
                searchQuery: '', 
                onlyDisplayBlockedUsers: true
            });
        });
    }

    #usersMenuHighlight() {
        const mainMenuUsersDOMElement = document.querySelector('#main-menu-users');
        this._helpers.SET_MENU_HIGHLIGHT(mainMenuUsersDOMElement);
    }

}