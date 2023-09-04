import { viewDOMElement } from '../index.js';
import { usersView } from '../view/usersView.js';
import { LoadController } from './loadController.js';
import { IndividualUserController } from './individualUserController.js';
import { HeaderController } from './headerController.js';
import { ErrorController } from './errorController.js';
import { UsersModel } from '../model/usersModel.js'
import { EncryptHelper } from '../helpers/encrypt.js';
import { SALT } from '../helpers/helpers.js';

export class UsersController {

    setViewUsers() {
        const loadController = new LoadController();
        loadController.displayLoading();
        const headerController = new HeaderController();
        const individualUserController = new IndividualUserController();
        const usersModel = new UsersModel();
        const encryptHelper = new EncryptHelper();

        headerController.setViewHeader();

        const mainMenuUsersDOMElement = document.querySelector('#main-menu-users');
        mainMenuUsersDOMElement.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';

        viewDOMElement.innerHTML = usersView;

        function showUsers(searchQuery = '') {
            usersModel.fetchUsers(searchQuery).then(res => {
                const userListDOMElement = document.querySelector('#user-list');
                userListDOMElement.innerHTML = res;

                // Click on individual user
                document.querySelectorAll('#all-users').forEach(function(getIndividualUser) {
                    getIndividualUser.addEventListener('click', function() {
                        // Get userId and then output user information
                        const userId = this.getAttribute('data-id');
                        SALT().then((salt) => {
                            const decrypt = encryptHelper.decipher(salt);
                            const decryptedId = decrypt(userId);
                            usersModel.fetchUserInfo(decryptedId).then(res => {
                                const userName = res[0];
                                const company = res[1];
                                individualUserController.getUser(userName, company);
                            });
                        })
                    })
                });
            });
        }

        showUsers();

        // Search for users
        const searchUsersBtnDOMElement = document.querySelector('#search-users-button');
        searchUsersBtnDOMElement.addEventListener('click', function(e) {
            try {
                e.preventDefault();
                const searchQuery = document.querySelector('#search-user').value;
                usersModel.validateSearch(searchQuery);

                showUsers(searchQuery);
            } catch(error) {
                const errorController = new ErrorController();
                errorController.displayErrorMessage(error);
            }
        });


    }

}