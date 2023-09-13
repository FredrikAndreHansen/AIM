import { viewDOMElement } from '../../index.js';
import { usersView } from '../../view/app/usersView.js';
import { AppController } from '../appController.js';
import { SALT, GET_DOM_VALUE, SET_INNER_HTML_VALUE, SET_MENU_HIGHLIGHT, ANIMATE_FADE_IN } from '../../helpers/helpers.js';

export class UsersController extends AppController {

    constructor(individualUserController, handlerController, encryptHelper, usersModel, individualUserModel) {
        super(individualUserController, handlerController, encryptHelper, usersModel, individualUserModel);
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
        return SET_INNER_HTML_VALUE({set: viewDOMElement, to: usersView(hasBlockedUsers)});
    }

    #displayUsers(searchQuery = '', onlyDisplayBlockedUsers = false) {
        this.usersModel.getUsers(searchQuery, onlyDisplayBlockedUsers).then(res => {
            this.#outputAllUsers(res);

            this.#getIndividualUser();
        });
    }

    #outputAllUsers(userInfo) {
        const userListDOMElement = document.querySelector('#user-list');
        SET_INNER_HTML_VALUE({set: userListDOMElement, to: userInfo});

        const allUsersDOMElement = document.querySelectorAll("#all-users");
        ANIMATE_FADE_IN(allUsersDOMElement);
    }

    #getIndividualUser() {
        const allUsersDOMElement = document.querySelectorAll("#all-users");

        allUsersDOMElement.forEach((getIndividualUser) => {
            
            getIndividualUser.addEventListener('click', () => {
                
                const userId = getIndividualUser.getAttribute('data-id');
                
                SALT().then((salt) => {
                    const decrypt = this.encryptHelper.decipher(salt);
                    const decryptedId = decrypt(userId);
                    
                    this.individualUserModel.getIndividualUser(decryptedId).then(res => {
                        const userName = res[0];
                        const company = res[1];
                        const userIsBlocked = res[2];
                        console.log(this.individualUserController);
                        this.individualUserController.setView(userId, userName, company, userIsBlocked);
                    });
                })
            })
        });
    }

    #searchUsers() {
        const searchUsersBtnDOMElement = document.querySelector('#search-users-button');
        searchUsersBtnDOMElement.addEventListener('click', (e) => {
            try {
                e.preventDefault();
                const searchQuery = GET_DOM_VALUE(document.querySelector('#search-user'));

                this.#displayUsers({
                    searchQuery: searchQuery, 
                    onlyDisplayBlockedUsers: false
                });
            } catch(error) {
                this.handlerController.displayMessage({message: error, isError: true});
            }
        });
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
        SET_MENU_HIGHLIGHT(mainMenuUsersDOMElement);
    }

}