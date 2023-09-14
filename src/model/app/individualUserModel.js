export class IndividualUserModel {

    constructor(authDependencies, loadDependencies, handlerDependencies, encryptDependencies, helpers) {
        this.authDependencies = authDependencies;
        this.loadDependencies = loadDependencies;
        this.handlerDependencies = handlerDependencies;
        this.encryptDependencies = encryptDependencies;
        this.helpers = helpers;
    }

    async getIndividualUser(userId) {
        this.authDependencies.validateIfLoggedIn();
    
        const currentUserId = this.helpers.GET_USER_ID();
        const dbRef = this.helpers.GET_DB_REFERENCE();

        return await new Promise((resolve, reject) => {

            this.helpers.SALT().then((salt) => {
                const decrypt = this.encryptDependencies.decipher(salt);
                const decryptedCurrentUserId = decrypt(currentUserId);

                this.helpers.GET_DB_USERS_INFO(dbRef, userId).then((snapshot) => {

                    this.helpers.GET_DB_USERS_INFO(dbRef, decryptedCurrentUserId).then((currentUser) => {
                        const loggedInUser = this.helpers.GET_VALUE(currentUser);
                        const blockedUsers = loggedInUser.blockedUsers;
                        
                        const isBlocked = !this.helpers.CHECK_IF_BLOCKED_USERS_EXISTS(blockedUsers, userId);
                    
                        if (this.helpers.IF_EXISTS(snapshot)) {
                            const user = this.helpers.GET_VALUE(snapshot);
                            this.loadDependencies.removeLoading();
                            
                            resolve([user.username, user.company, isBlocked]);
                        } else {
                            this.loadDependencies.removeLoading();
                            reject(this.handlerDependencies.throwError("No data available!"));
                        }
                    }).catch((error) => {
                        this.loadDependencies.removeLoading();
                        this.handlerDependencies.displayMessage({message: error, isError: true});
                    });
                });
            });
        });
    }

    toggleUserBlock(userinfo) {
        const { userId, blockUser } = userinfo;

        const loggedInUser = this.helpers.GET_USER_ID();

        this.helpers.SALT().then((salt) => {
            const decrypt = this.encryptDependencies.decipher(salt);
            const encryptedLoggedInUserId = decrypt(loggedInUser);
            const encryptedUserId = decrypt(userId);

            const dbRef = this.helpers.GET_DB_REFERENCE();

            this.helpers.GET_DB_USERS_INFO(dbRef, encryptedLoggedInUserId).then((snapshot) => {
                try{
                    if (this.helpers.IF_EXISTS(snapshot)) {
                        const user = this.helpers.GET_VALUE(snapshot);
                        let blockedUsers = user.blockedUsers;
                        blockedUsers = this.#checkIfBlockedUsersIsDefined(blockedUsers);

                        blockedUsers = this.#blockOrUnblockUser({
                            toggleBlock: blockUser, 
                            blockedUsers: blockedUsers, 
                            encryptedUserId: encryptedUserId,
                            checkIfBlockedUserExists: this.helpers.CHECK_IF_BLOCKED_USERS_EXISTS(blockedUsers, encryptedUserId)
                        });

                        this.helpers.SAVE_TO_DB_IN_USERS({
                            dbReference: dbRef,
                            firstChild: encryptedLoggedInUserId,
                            secondChild: 'blockedUsers',
                            saveValue: blockedUsers
                        });
                    } else {
                        this.handlerDependencies.throwError("No data available!");
                    }
                } catch(error) {
                    this.handlerDependencies.displayMessage({message: error, isError: true});
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