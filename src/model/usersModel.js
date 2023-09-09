import { userOutputView } from "../view/app/usersView.js";
import { HandlerController } from "../controller/handlers/handlerController.js";
import { LoadController } from "../controller/handlers/loadController.js";
import { AuthHelper } from "../helpers/auth.js";
import { EncryptHelper } from "../helpers/encrypt.js";
import { SALT, PARSESTRING, TRIMSTRING, GET_DB_REFERENCE, GET_DB_USERS_INFO, SAVE_TO_DB_IN_USERS, IF_EXISTS, GET_VALUE } from "../helpers/helpers.js";

const handlerController = new HandlerController();
const encryptHelper = new EncryptHelper();
const loadController = new LoadController();

export class UsersModel {
    
    async fetchUserInfo(userId) {
        const authHelper = new AuthHelper();
        authHelper.validateIfLoggedIn();

        const currentUserId = this.#getUserId();

        const dbRef = GET_DB_REFERENCE();

        return await new Promise(function(resolve) {

            SALT().then((salt) => {
                const decrypt = encryptHelper.decipher(salt);
                const decryptedCurrentUserId = decrypt(currentUserId);

                GET_DB_USERS_INFO(dbRef, userId).then((snapshot) => {

                    GET_DB_USERS_INFO(dbRef, decryptedCurrentUserId).then((currentUser) => {
                        const loggedInUser = GET_VALUE(currentUser);
                        const blockedUsers = loggedInUser.blockedUsers;
                        
                        const isBlocked = !checkIfBlockedUserExists(blockedUsers, userId);
                    
                        if (IF_EXISTS(snapshot)) {
                            const user = GET_VALUE(snapshot);
                            loadController.removeLoading();
                            resolve([ user.username, user.company, isBlocked ]);
                        } else {
                            loadController.removeLoading();
                            handlerController.throwError("No data available!");
                        }
                        }).catch((error) => {
                            loadController.removeLoading();
                            handlerController.displayMessage({message: error, isError: true});
                    })
                })
            })
        })
    }

    async fetchUsers(displayArguments) {
        const { searchQuery = '', onlyDisplayBlockedUsers = false } = displayArguments;

        const authHelper = new AuthHelper();
        authHelper.validateIfLoggedIn();

        const starCountRef = GET_DB_REFERENCE('users/');

        const userId = this.#getUserId();
        let HTMLInput = '';

        return await new Promise(function(resolve) {
            starCountRef.on('value', (snapshot) => {
                const users = GET_VALUE(snapshot);

                SALT().then((salt) => {
                    const decrypt = encryptHelper.decipher(salt);
                    const decryptedUserId = decrypt(userId);
                    const dbRef = GET_DB_REFERENCE();

                    GET_DB_USERS_INFO(dbRef, decryptedUserId).then((snapshot) => {
                        try {
                            if (IF_EXISTS(snapshot)) {
                                const user = GET_VALUE(snapshot);
                                const blockedUsers = user.blockedUsers;

                                HTMLInput = outputUsers(users, decryptedUserId, searchQuery, salt, blockedUsers);

                                loadController.removeLoading();

                                resolve(HTMLInput);
                            } else {
                                handlerController.throwError("No data available!");
                            }
                        } catch (error) {
                            handlerController.displayMessage({message: error, isError: true});
                        }
                    })
                })
            });
        })

        function outputUsers(users, userId, searchQuery, salt, blockedUsers) {
            let i = 0;
            let HTMLOutput = '';
        
            HTMLOutput += getSearchOutputInfo(searchQuery);
        
            for (const key in users) {
                if (key === userId) { continue; }
                
                const blockedCurrentUser = users[key].blockedUsers;
                const userName = users[key].username;
                const company = users[key].company;

                if (ifSearchIncludesValues(userName, company, searchQuery)) {
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

            HTMLOutput += getSearchOutputInfo(false, i);
        
            return HTMLOutput;
        }

        function getSearchOutputInfo(searchQuery, i = -1) {
            if (searchQuery !== '' && searchQuery !== false && i === -1) {
                return `<p class="paragraph-absolute-center">Results for: ${searchQuery}</p><br>`;
            }

            if (i === 0) {
                return '<p class="paragraph-center">No results!</p>';
            }

            return '';
        }

        function ifSearchIncludesValues(userName, company, searchQuery) {
            const formattedUserName = userName.toLowerCase();
            const formattedCompany = company.toLowerCase();
            const formattedSearchQuery = searchQuery.toLowerCase();

            if (formattedUserName.includes(formattedSearchQuery) || formattedCompany.includes(formattedSearchQuery)) {
                return true;
            } else {
                return false;
            }
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

            const dbRef = GET_DB_REFERENCE();

            GET_DB_USERS_INFO(dbRef, encryptedLoggedInUserId).then((snapshot) => {
                try{
                    if (IF_EXISTS(snapshot)) {
                        const user = GET_VALUE(snapshot);
                        let blockedUsers = user.blockedUsers;
                        blockedUsers = this.#checkIfBlockedUsersIsDefined(blockedUsers);

                        blockedUsers = this.#blockOrUnblockUser({
                            toggleBlock: blockUser, 
                            blockedUsers: blockedUsers, 
                            encryptedUserId: encryptedUserId,
                            checkIfBlockedUserExists: checkIfBlockedUserExists(blockedUsers, encryptedUserId)
                        });

                        SAVE_TO_DB_IN_USERS({
                            dbReference: dbRef,
                            firstChild: encryptedLoggedInUserId,
                            secondChild: 'blockedUsers',
                            saveValue: blockedUsers
                        });
                    } else {
                        handlerController.throwError("No data available!");
                    }
                } catch(error) {
                    handlerController.displayMessage({message: error, isError: true});
                }
            })
        });
    }

    #blockOrUnblockUser(blockedUserInfo) {
        const { toggleBlock, blockedUsers, encryptedUserId, checkIfBlockedUserExists } = blockedUserInfo;

        if (toggleBlock === true && checkIfBlockedUserExists === true) {
            blockedUsers.push(encryptedUserId);
            return blockedUsers;
        } else {
            return blockedUsers.filter((getBlockedUserId) => {
                return getBlockedUserId !== encryptedUserId;
            });
        }
    }

    #checkIfBlockedUsersIsDefined(blockedUsers) {
        if (!blockedUsers || blockedUsers === undefined || blockedUsers === null) {
            return [""];
        } else {
            return blockedUsers;
        }
    }

    async checkIfAnyUsersAreBlocked() {
        const userId = this.#getUserId();

        return await new Promise(function(resolve) {

            SALT().then((salt) => {
                const decrypt = encryptHelper.decipher(salt); 
                const decryptedUserId = decrypt(userId);
                const dbRef = GET_DB_REFERENCE();

                GET_DB_USERS_INFO(dbRef, decryptedUserId).then((snapshot) => {
                    try {
                        if (IF_EXISTS(snapshot)) {
                            const user = GET_VALUE(snapshot);
                            const blockedUsers = user.blockedUsers;

                            resolve(ifAnyBlockedUsers(blockedUsers));
                        } else {
                            handlerController.throwError("No data available!");
                        }
                    } catch (error) {
                        handlerController.displayMessage({message: error, isError: true});
                    }
                })
            })
        })
    }

}

function ifAnyBlockedUsers(blockedUsers) {
    if (blockedUsers && blockedUsers.length > 1) {
        return true;
    } else {
        return false;
    }
}

function checkIfBlockedUserExists(blockedUsers, encryptedUserId) {
    if (!blockedUsers) {
        return true;
    }

    for(let i = 0; i < blockedUsers.length; i++) {
        if (blockedUsers[i] === encryptedUserId) {
            return false;
        }
    }
    return true; 
}