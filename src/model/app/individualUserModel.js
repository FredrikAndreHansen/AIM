import { HandlerController } from "../../controller/handlers/handlerController.js";
import { LoadController } from "../../controller/handlers/loadController.js";
import { AuthHelper } from "../../helpers/auth.js";
import { EncryptHelper } from "../../helpers/encrypt.js";
import { SALT, GET_DB_REFERENCE, GET_DB_USERS_INFO, IF_EXISTS, GET_VALUE, GET_USER_ID, CHECK_IF_BLOCKED_USERS_EXISTS, SAVE_TO_DB_IN_USERS } from "../../helpers/helpers.js";

const handlerController = new HandlerController();
const encryptHelper = new EncryptHelper();
const loadController = new LoadController();

export class IndividualUserModel {

    async getIndividualUser(userId) {
        const authHelper = new AuthHelper();
        authHelper.validateIfLoggedIn();
    
        const currentUserId = GET_USER_ID();
        const dbRef = GET_DB_REFERENCE();

        return await new Promise((resolve, reject) => {

            SALT().then((salt) => {
                const decrypt = encryptHelper.decipher(salt);
                const decryptedCurrentUserId = decrypt(currentUserId);

                GET_DB_USERS_INFO(dbRef, userId).then((snapshot) => {

                    GET_DB_USERS_INFO(dbRef, decryptedCurrentUserId).then((currentUser) => {
                        const loggedInUser = GET_VALUE(currentUser);
                        const blockedUsers = loggedInUser.blockedUsers;
                        
                        const isBlocked = !CHECK_IF_BLOCKED_USERS_EXISTS(blockedUsers, userId);
                    
                        if (IF_EXISTS(snapshot)) {
                            const user = GET_VALUE(snapshot);
                            loadController.removeLoading();
                            
                            resolve([ user.username, user.company, isBlocked ]);
                        } else {
                            loadController.removeLoading();
                            reject(handlerController.throwError("No data available!"));
                        }
                    }).catch((error) => {
                        loadController.removeLoading();
                        handlerController.displayMessage({message: error, isError: true});
                    });
                });
            });
        });
    }

    toggleUserBlock(userinfo) {
        const { userId, blockUser } = userinfo;

        const loggedInUser = GET_USER_ID();

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
                            checkIfBlockedUserExists: CHECK_IF_BLOCKED_USERS_EXISTS(blockedUsers, encryptedUserId)
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

}