import { SALT, GET_DB_REFERENCE, GET_DB_USERS_INFO, IF_EXISTS, GET_VALUE, GET_USER_ID, CHECK_IF_BLOCKED_USERS_EXISTS, SAVE_TO_DB_IN_USERS } from "../../helpers/helpers.js";

export class IndividualUserModel {

    constructor(authHelper, loadController, handlerController, encryptHelper) {
        this.authHelper = authHelper;
        this.loadController = loadController;
        this.handlerController = handlerController;
        this.encryptHelper = encryptHelper;
    }

    async getIndividualUser(userId) {
        this.authHelper.validateIfLoggedIn();
    
        const currentUserId = GET_USER_ID();
        const dbRef = GET_DB_REFERENCE();

        return await new Promise((resolve, reject) => {

            SALT().then((salt) => {
                const decrypt = this.encryptHelper.decipher(salt);
                const decryptedCurrentUserId = decrypt(currentUserId);

                GET_DB_USERS_INFO(dbRef, userId).then((snapshot) => {

                    GET_DB_USERS_INFO(dbRef, decryptedCurrentUserId).then((currentUser) => {
                        const loggedInUser = GET_VALUE(currentUser);
                        const blockedUsers = loggedInUser.blockedUsers;
                        
                        const isBlocked = !CHECK_IF_BLOCKED_USERS_EXISTS(blockedUsers, userId);
                    
                        if (IF_EXISTS(snapshot)) {
                            const user = GET_VALUE(snapshot);
                            this.loadController.removeLoading();
                            
                            resolve([user.username, user.company, isBlocked]);
                        } else {
                            this.loadController.removeLoading();
                            reject(this.handlerController.throwError("No data available!"));
                        }
                    }).catch((error) => {
                        this.loadController.removeLoading();
                        this.handlerController.displayMessage({message: error, isError: true});
                    });
                });
            });
        });
    }

    toggleUserBlock(userinfo) {
        const { userId, blockUser } = userinfo;

        const loggedInUser = GET_USER_ID();

        SALT().then((salt) => {
            const decrypt = this.encryptHelper.decipher(salt);
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
                        this.handlerController.throwError("No data available!");
                    }
                } catch(error) {
                    this.handlerController.displayMessage({message: error, isError: true});
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