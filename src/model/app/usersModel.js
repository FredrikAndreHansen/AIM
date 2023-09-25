export class UsersModel {

    constructor(authDependencies, loadDependencies, handlerDependencies, encryptDependencies, helpers, views) {
        this.authDependencies = authDependencies;
        this.loadDependencies = loadDependencies;
        this.handlerDependencies = handlerDependencies;
        this.encryptDependencies = encryptDependencies;
        this.helpers = helpers;
        this.views = views;
    }
   
    async getUsers(displayArguments) {
        const { searchQuery = '', onlyDisplayBlockedUsers = false } = displayArguments;

        this.authDependencies.validateIfLoggedIn();

        const getAllUsers = this.helpers.GET_DB_ALL_USERS();

        const userId = this.helpers.GET_USER_ID();
        
        return await new Promise((resolve, reject) => {
            getAllUsers.on('value', (snapshot) => {
                const users = this.helpers.GET_VALUE(snapshot);
                
                this.helpers.SALT().then((salt) => {
                    const decrypt = this.encryptDependencies.decipher(salt);
                    const decryptedUserId = decrypt(userId);
                    const dbRef = this.helpers.GET_DB_REFERENCE();

                    this.helpers.GET_DB_USERS_INFO(dbRef, decryptedUserId).then((snapshot) => {
                        try {
                            if (this.helpers.IF_EXISTS(snapshot)) {
                                const user = this.helpers.GET_VALUE(snapshot);
                                const blockedUsers = user.blockedUsers;
                                const encrypt = this.encryptDependencies.cipher(salt);

                                const HTMLInput = this.#outputUsers(users, decryptedUserId, searchQuery, blockedUsers, encrypt, onlyDisplayBlockedUsers);
        
                                this.loadDependencies.removeLoading();

                                resolve(HTMLInput);
                            } else {
                                reject(this.handlerDependencies.throwError("No data available!"));
                            }
                        } catch (error) {
                            this.handlerDependencies.displayMessage({message: error, isError: true});
                        }
                    })
                })
            });
        })
    }

    #outputUsers(users, userId, searchQuery, blockedUsers, encrypt, onlyDisplayBlockedUsers) {
        let i = 0;
        let HTMLOutput = '';
        
        HTMLOutput += this.#getSearchOutputInfo(searchQuery);
        
        for (const key in users) {
            if (key === userId) { continue; }
                
            const blockedCurrentUser = users[key].blockedUsers;
            const userName = users[key].username;
            const company = users[key].company;

            if (this.#ifSearchIncludesValues(userName, company, searchQuery)) {
                    
                const encryptedKey = encrypt(key);

                HTMLOutput += this.#outputUserInfo({
                    outputUserId: encryptedKey,
                    outputUsers: users,
                    key: key,
                    blockedUsers: blockedUsers,
                    currentUserId: userId,
                    blockedCurrentUser: blockedCurrentUser,
                    onlyDisplayBlockedUsers: onlyDisplayBlockedUsers
                });
 
                i++;
            }
            if (i > 99) { break };
        }

        HTMLOutput += this.#getSearchOutputInfo(false, i);
        
        return HTMLOutput;
    }

    #getSearchOutputInfo(searchQuery, i = -1) {
        if (searchQuery !== '' && searchQuery !== false && i === -1) {
            return this.views.userSearchOutput(searchQuery);
        }

        if (i === 0) {
            return this.views.userSearchOutput();
        }

        return '';
    }

    #ifSearchIncludesValues(userName, company, searchQuery) {
        const formattedUserName = userName.toLowerCase();
        const formattedCompany = company.toLowerCase();
        const formattedSearchQuery = searchQuery.toLowerCase();

        if (formattedUserName.includes(formattedSearchQuery) || formattedCompany.includes(formattedSearchQuery)) {
            return true;
        } else {
            return false;
        }
    }

    #outputUserInfo(userData) {
        const { outputUserId, outputUsers, key, blockedUsers, currentUserId, blockedCurrentUser, onlyDisplayBlockedUsers } = userData;

        if (!this.helpers.CHECK_IF_BLOCKED_USERS_EXISTS(blockedCurrentUser, currentUserId)) {
            return '';
        }
        
        if (this.helpers.CHECK_IF_BLOCKED_USERS_EXISTS(blockedUsers, key)) {   
            if (onlyDisplayBlockedUsers == true){
                return '';
            }             
            return this.views.userOutputView(outputUserId, outputUsers, key, false);
        } else {
            return this.views.userOutputView(outputUserId, outputUsers, key, true);
        }
    }
  
    async checkIfAnyUsersAreBlocked() {
        const userId = this.helpers.GET_USER_ID();

        return await new Promise((resolve, reject) => {

            this.helpers.SALT().then((salt) => {
                const decrypt = this.encryptDependencies.decipher(salt); 
                const decryptedUserId = decrypt(userId);
                const dbRef = this.helpers.GET_DB_REFERENCE();

                this.helpers.GET_DB_USERS_INFO(dbRef, decryptedUserId).then((snapshot) => {
                    try {
                        if (this.helpers.IF_EXISTS(snapshot)) {
                            const user = this.helpers.GET_VALUE(snapshot);
                            const blockedUsers = user.blockedUsers;

                            resolve(this.helpers.IF_ANY_BLOCKED_USERS(blockedUsers));
                        } else {
                            reject(this.handlerDependencies.throwError("No data available!"));
                        }
                    } catch (error) {
                        this.handlerDependencies.displayMessage({message: error, isError: true});
                    }
                })
            })
        })
    }

}