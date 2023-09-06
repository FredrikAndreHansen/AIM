import { userOutputView } from "../view/usersView.js";
import { ErrorController } from "../controller/errorController.js";
import { LoadController } from "../controller/loadController.js";
import { AuthHelper } from "../helpers/auth.js";
import { EncryptHelper } from "../helpers/encrypt.js";
import { SALT, PARSESTRING, TRIMSTRING } from "../helpers/helpers.js";

const errorController = new ErrorController();
const encryptHelper = new EncryptHelper();
const loadController = new LoadController();

export class UsersModel {
    
    async fetchUserInfo(userId) {
        const authHelper = new AuthHelper();
        authHelper.validateIfLoggedIn();

        const currentUserId = this.#getUserId();

        const dbRef = firebase.database().ref();

        return await new Promise(function(resolve) {

            SALT().then((salt) => {
                const decrypt = encryptHelper.decipher(salt);
                const decryptedCurrentUserId = decrypt(currentUserId);

                dbRef.child("users").child(userId).get().then((snapshot) => {

                    dbRef.child("users").child(decryptedCurrentUserId).get().then((currentUser) => {
                        const loggedInUser = currentUser.val();
                        const blockedUsers = loggedInUser.blockedUsers;
                        
                        let isBlocked = false;
                        if (checkIfBlockedUserExists(blockedUsers, userId)) {
                            isBlocked = false;
                        } else {
                            isBlocked = true;
                        }
                    
                        if (snapshot.exists()) {
                            const user = snapshot.val();
                            loadController.removeLoading();
                            resolve([user.username, user.company, isBlocked]);
                        } else {
                            loadController.removeLoading();
                            errorController.throwError("No data available!");
                        }
                        }).catch((error) => {
                            loadController.removeLoading();
                            errorController.displayErrorMessage(error);
                    })
                })
            })
        })
    }

    async fetchUsers(displayArguments) {
        const {searchQuery = '', onlyDisplayBlockedUsers = false} = displayArguments;

        const authHelper = new AuthHelper();
        authHelper.validateIfLoggedIn();

        const starCountRef = firebase.database().ref('users/');
        const userId = this.#getUserId();
        let HTMLInput = '';

        return await new Promise(function(resolve) {
            starCountRef.on('value', (snapshot) => {
                const users = snapshot.val();

                SALT().then((salt) => {
                    const decrypt = encryptHelper.decipher(salt); 
                    const decryptedUserId = decrypt(userId);
                    const dbRef = firebase.database().ref();

                    dbRef.child("users").child(decryptedUserId).get().then((snapshot) => {
                        try {
                            if (snapshot.exists()) {
                                const user = snapshot.val();
                                const blockedUsers = user.blockedUsers;

                                HTMLInput = outputUsers(users, decryptedUserId, searchQuery, salt, blockedUsers);

                                loadController.removeLoading();

                                resolve(HTMLInput);
                            } else {
                                errorController.throwError("No data available!");
                            }
                        } catch (error) {
                            errorController.displayErrorMessage(error);
                        }
                    })
                })
            });
        })

        function outputUsers(users, userId, searchQuery, salt, blockedUsers) {
            let i = 0;
            let HTMLOutput = '';
        
            if (searchQuery !== '') {
                HTMLOutput += `<p class="paragraph-absolute-center">Results for: ${searchQuery}</p><br>`;
            }
        
            for (const key in users) {
                if (key === userId) { continue; }
                
                // Get search results, if any
                const getFormattedUserName = users[key].username.toLowerCase();
                const getFormattedCompany = users[key].company.toLowerCase();
                const formattedSearchQuery = searchQuery.toLowerCase();
                const blockedCurrentUser = users[key].blockedUsers;

                // Print the user based on search and also don't print the logged in user
                if (getFormattedUserName.includes(formattedSearchQuery) || getFormattedCompany.includes(formattedSearchQuery)) {
                    const encrypt = encryptHelper.cipher(salt);
                    const encryptedKey = encrypt(key);

                    HTMLOutput += outputUserInfo({
                        outputUserId: encryptedKey,
                        outputUsers: users,
                        key: key,
                        blockedUsers: blockedUsers,
                        currentUserId: userId,
                        blockedCurrentUser: blockedCurrentUser
                    });
 
                    i++;
                }
                if (i > 99) { break };
            }
        
            if (i === 0) {
                HTMLOutput += '<p class="paragraph-center">No results!</p>'
            }
        
            return HTMLOutput;
        }

        function outputUserInfo(userData) {
            const { outputUserId, outputUsers, key, blockedUsers, currentUserId, blockedCurrentUser } = userData;

            if (!checkIfBlockedUserExists(blockedCurrentUser, currentUserId)) {
                return '';
            }
            if (checkIfBlockedUserExists(blockedUsers, key)) {   
                if (onlyDisplayBlockedUsers == true){
                    return '';
                }             
                return userOutputView(outputUserId, outputUsers, key, false);
            } else {
                return userOutputView(outputUserId, outputUsers, key, true);
            }
        }
  
    }

    #getUserId() {
        const token = PARSESTRING(localStorage.getItem('AIMNomadToken'));
        const [userIdRaw, _, __] = token.split(',');
        return TRIMSTRING(userIdRaw);
    }

    toggleUserBlock(userinfo) {
        const { userId, blockUser } = userinfo;

        const loggedInUser = this.#getUserId();

        SALT().then((salt) => {
            const decrypt = encryptHelper.decipher(salt);
            const encryptedLoggedInUserId = decrypt(loggedInUser);
            const encryptedUserId = decrypt(userId);

            const dbRef = firebase.database().ref();

            dbRef.child("users").child(encryptedLoggedInUserId).get().then((snapshot) => {
                try{
                    if (snapshot.exists()) {
                        const user = snapshot.val();
                        let blockedUsers = user.blockedUsers;

                        if (blockUser === true) {
                            if (checkIfBlockedUserExists(blockedUsers, encryptedUserId)) {
                                blockedUsers.push(encryptedUserId);
                            }
                        } else {
                            if (!checkIfBlockedUserExists(blockedUsers, encryptedUserId)) {
                                blockedUsers = blockedUsers.filter((getBlockedUserId) => {
                                    return getBlockedUserId !== encryptedUserId;
                                })
                            }
                        }

                        dbRef.child("users").child(encryptedLoggedInUserId).child("blockedUsers").set(blockedUsers);
                    } else {
                        errorController.throwError("No data available!");
                    }
                } catch(error) {
                    errorController.displayErrorMessage(error);
                }
            })
        });
    }

    async checkIfAnyUsersAreBlocked() {
        const userId = this.#getUserId();

        return await new Promise(function(resolve) {

        SALT().then((salt) => {
            const decrypt = encryptHelper.decipher(salt); 
            const decryptedUserId = decrypt(userId);
            const dbRef = firebase.database().ref();

            dbRef.child("users").child(decryptedUserId).get().then((snapshot) => {
                try {
                    if (snapshot.exists()) {
                        const user = snapshot.val();
                        const blockedUsers = user.blockedUsers;

                        if (blockedUsers.length > 1) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    } else {
                        errorController.throwError("No data available!");
                    }
                } catch (error) {
                    errorController.displayErrorMessage(error);
                }
            })
        })
        

    })

    }

}

function checkIfBlockedUserExists(blockedUsers, encryptedUserId) {
    for(let i = 0; i < blockedUsers.length; i++) {
        if (blockedUsers[i] === encryptedUserId) {
            return false;
        }
    }
    return true;
}