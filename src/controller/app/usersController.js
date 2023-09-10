import { viewDOMElement } from '../../index.js';
import { usersView } from '../../view/app/usersView.js';
import { LoadController } from '../handlers/loadController.js';
import { IndividualUserController } from './individualUserController.js';
import { NavigateController } from '../handlers/navigateController.js';
import { HandlerController } from '../handlers/handlerController.js';
import { UsersModel } from '../../model/usersModel.js'
import { IndividualUserModel } from '../../model/individualUserModel.js';
import { EncryptHelper } from '../../helpers/encrypt.js';
import { SALT, GET_DOM_VALUE, SET_INNER_HTML_VALUE, SET_MENU_HIGHLIGHT } from '../../helpers/helpers.js';

const usersModel = new UsersModel();
const individualUserModel = new IndividualUserModel();

export class UsersController {

    setView() {
        const loadController = new LoadController();
        loadController.displayLoading();

        const navigateController = new NavigateController();
        navigateController.setView();

        this.#usersMenuHighlight();

        usersModel.checkIfAnyUsersAreBlocked().then((hasBlockedUsers) => {
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
        usersModel.getUsers(searchQuery, onlyDisplayBlockedUsers).then(res => {
            this.#outputAllUsers(res);

            this.#getIndividualUser();
        });
    }

    #outputAllUsers(userInfo) {
        const userListDOMElement = document.querySelector('#user-list');

        return SET_INNER_HTML_VALUE({set: userListDOMElement, to: userInfo});
    }

    #getIndividualUser() {
        document.querySelectorAll('#all-users').forEach(function(getIndividualUser) {

            getIndividualUser.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');

                SALT().then((salt) => {
                    const encryptHelper = new EncryptHelper();
                    const decrypt = encryptHelper.decipher(salt);
                    const decryptedId = decrypt(userId);
                    individualUserModel.getIndividualUser(decryptedId).then(res => {
                        const userName = res[0];
                        const company = res[1];
                        const userIsBlocked = res[2];
                        const individualUserController = new IndividualUserController();
                            
                        individualUserController.setView(userId, userName, company, userIsBlocked);
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
                const handlerController = new HandlerController();
                handlerController.displayMessage({message: error, isError: true});
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