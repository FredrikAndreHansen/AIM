import { ErrorController } from "../controller/errorController.js";
import { LoadController } from "../controller/loadController.js";
import { AuthHelper } from "../helpers/auth.js";
import { EncryptHelper } from "../helpers/encrypt.js";
import { SALT } from "../helpers/helpers.js";

// Initialize classes
const errorController = new ErrorController();
const encryptHelper = new EncryptHelper();

export class UsersModel {
    
    async fetchUserInfo(userId) {
        // Initialize classes
        const loadController = new LoadController;
        const authHelper = new AuthHelper();
        authHelper.validateIfLoggedIn();

        const dbRef = firebase.database().ref();

        return await new Promise(function(resolve, reject) {
            dbRef.child("users").child(userId).get().then((snapshot) => {
            if (snapshot.exists()) {
                const user = snapshot.val();
                loadController.removeLoading();
                resolve([user.username, user.company]);
            } else {
                loadController.removeLoading();
                errorController.displayErrorMessage("No data available!");
                reject();
            }
            }).catch((error) => {
                loadController.removeLoading();
                errorController.displayErrorMessage(error);
            })
        })
    }

    async fetchUsers(searchQuery = '') {
        // Initialize classes
        const loadController = new LoadController;
        const authHelper = new AuthHelper();
        authHelper.validateIfLoggedIn();

        const starCountRef = firebase.database().ref('users/');
        let HTMLInput = '';

        return await new Promise(function(resolve, reject) {
            let i = 0;

            const userId = localStorage.getItem('AIMNomadToken');
            starCountRef.on('value', (snapshot) => {
                const users = snapshot.val();
                SALT().then((salt) => {
                    for (const key in users) {
                        // Get search results, if any
                        const getFormattedUserName = users[key].username.toLowerCase();
                        const getFormattedCompany = users[key].company.toLowerCase();
                        const formattedSearchSearchQuery = searchQuery.toLowerCase();
                        // Print the user based on search and also don't print the logged in user
                        if (key !== userId && getFormattedUserName.includes(formattedSearchSearchQuery) || getFormattedCompany.includes(formattedSearchSearchQuery)) {
                            // Encrypt the key before output
                            const encrypt = encryptHelper.cipher(salt);
                            const encryptedKey = encrypt(key);
                            HTMLInput += `<tr id="all-users" data-id="${encryptedKey}"><td class="user-td"><img class="user-icon" src="../../graphic/userIcon.svg" /></td><td><p class="paragraph-center">${users[key].username}</p><hr class="hr-x-small" style="margin-top: -8px;"><p class="paragraph-center-small" style="margin-top: -6px;">${users[key].company}</p></td></tr>`;
                            i++;
                        }
                        if (i > 99) { break };
                    }
                    loadController.removeLoading();
                    resolve(HTMLInput);
                })
            });
        })
    }

}