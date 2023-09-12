import { userOutputView, userSearchOutput } from "../../view/app/usersView.js";
import { HandlerController } from "../../controller/handlers/handlerController.js";
import { LoadController } from "../../controller/handlers/loadController.js";
import { AuthHelper } from "../../helpers/auth.js";
import { EncryptHelper } from "../../helpers/encrypt.js";
import { SALT, GET_DB_REFERENCE, GET_DB_USERS_INFO, IF_EXISTS, GET_VALUE, GET_USER_ID, CHECK_IF_BLOCKED_USERS_EXISTS, IF_ANY_BLOCKED_USERS, USERS_REF } from "../../helpers/helpers.js";

const handlerController = new HandlerController();
const encryptHelper = new EncryptHelper();
const loadController = new LoadController();

export class UsersModel {
    
    async getUsers(displayArguments) {
        const { searchQuery = '', onlyDisplayBlockedUsers = false } = displayArguments;
        
        const authHelper = new AuthHelper();
        authHelper.validateIfLoggedIn();

        const starCountRef = GET_DB_REFERENCE(USERS_REF);

        const userId = GET_USER_ID();
        
        return await new Promise((resolve, reject) => {
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

                                const HTMLInput = outputUsers(users, decryptedUserId, searchQuery, salt, blockedUsers);
                                
                                loadController.removeLoading();

                                resolve(HTMLInput);
                            } else {
                                reject(handlerController.throwError("No data available!"));
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
                return userSearchOutput(searchQuery);
            }

            if (i === 0) {
                return userSearchOutput();
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

            if (!CHECK_IF_BLOCKED_USERS_EXISTS(blockedCurrentUser, currentUserId)) {
                return '';
            }
            if (CHECK_IF_BLOCKED_USERS_EXISTS(blockedUsers, key)) {   
                if (onlyDisplayBlockedUsers == true){
                    return '';
                }             
                return userOutputView(outputUserId, outputUsers, key, false);
            } else {
                return userOutputView(outputUserId, outputUsers, key, true);
            }
        }
  
    }

    async checkIfAnyUsersAreBlocked() {
        const userId = GET_USER_ID();

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

                            resolve(IF_ANY_BLOCKED_USERS(blockedUsers));
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