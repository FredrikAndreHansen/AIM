export class IndividualTeamModel {

    constructor(authDependencies, loadDependencies, handlerDependencies, encryptDependencies, helpers, views) {
        this.authDependencies = authDependencies;
        this.loadDependencies = loadDependencies;
        this.handlerDependencies = handlerDependencies;
        this.encryptDependencies = encryptDependencies;
        this.helpers = helpers;
        this.views = views;
    }

    async getIndividualTeam(teamId) {
        this.loadDependencies.displayLoading();
        this.authDependencies.validateIfLoggedIn();

        const dbRef = this.helpers.GET_DB_REFERENCE();
        const userId = this.helpers.GET_USER_ID();
  
        return await new Promise((resolve, reject) => {

            this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamId).then((snapshot) => {
  
                this.helpers.SALT().then((salt) => {
                    const decrypt = this.encryptDependencies.decipher(salt);
                    const loggedInUserId = decrypt(userId);

                    if (this.helpers.IF_EXISTS(snapshot)) {
                        const team = this.helpers.GET_VALUE(snapshot);

                        let isAdmin = false;
                        if (team.teamCreatorId === loggedInUserId) {isAdmin = true;}

                        resolve({team, isAdmin});
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
    }

    async generateTeamUsers(members, invitedUsers, config, teamId) {
        this.loadDependencies.displayLoading();
        this.authDependencies.validateIfLoggedIn();

        const getAllUsers = this.helpers.GET_DB_ALL_USERS();
        const userId = this.helpers.GET_USER_ID();

        return await new Promise((resolve, reject) => {
            getAllUsers.on('value', (snapshot) => {
  
                this.helpers.SALT().then((salt) => {
                    const dbRef = this.helpers.GET_DB_REFERENCE();
                    const decrypt = this.encryptDependencies.decipher(salt);
                    const loggedInUserId = decrypt(userId);

                    this.helpers.GET_DB_USERS_INFO(dbRef, loggedInUserId).then((getLoggedInUser) => {
                        this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamId).then((getTeam) => {
                            try {
                                if (this.helpers.IF_EXISTS(getLoggedInUser) && this.helpers.IF_EXISTS(getTeam)) {
                                    const loggedInUser = this.helpers.GET_VALUE(getLoggedInUser);
                                    const blockedUsers = loggedInUser.blockedUsers;

                                    const team = this.helpers.GET_VALUE(getTeam);
                                    const teamAdmin = team.teamCreatorId;

                                    const encrypt = this.encryptDependencies.cipher(salt);
                                    const users = this.helpers.GET_VALUE(snapshot);

                                    const allowedToRemovePending = config.allAllowedToRemovePendingInvites;
                                    const allowedToRemoveUsers = config.allAllowedToRemoveUsers

                                    const HTMLMembersOutput = this.#generateTeamUsersOutput(members, users, encrypt, blockedUsers, loggedInUserId, allowedToRemoveUsers, teamAdmin);

                                    const HTMLInvitedUsersOutput = this.#generateTeamUsersOutput(invitedUsers, users, encrypt, blockedUsers, loggedInUserId, allowedToRemovePending);

                                    this.loadDependencies.removeLoading();

                                    resolve([HTMLMembersOutput, HTMLInvitedUsersOutput]);
                                } else {
                                    reject(this.handlerDependencies.throwError("No data available!"));
                                }
                            } catch(error) {
                                this.loadDependencies.removeLoading();
                                reject(this.handlerDependencies.displayMessage({message: error, isError: true}));
                            }
                        });
                    });
                });
            });
        });
    }

    #generateTeamUsersOutput(members, users, encrypt, blockedUsers, loggedInUserId, allowedToRemove, teamAdmin = false) {
        let HTMLOutput = "";

        for (let i = 0; i < members.length; i++) {
            for (const key in users) {

                let block = !allowedToRemove;

                let checkIfUserBlockedYou = users[key].blockedUsers;
                for (const key in checkIfUserBlockedYou) {
                    if (loggedInUserId === checkIfUserBlockedYou[key] && loggedInUserId !== teamAdmin) {block = true;}
                }

                let isSelf = false;
                if (key === loggedInUserId) {isSelf = true;block = true;}

                let isAdmin = false;
                if (key === teamAdmin) {isAdmin = true;block = true;}
    
                if (key === members[i]) {
                    const encryptedKey = encrypt(key);
                    const isBlocked = !this.helpers.CHECK_IF_BLOCKED_USERS_EXISTS(blockedUsers, key);

                    HTMLOutput += this.views.userOutputView(encryptedKey, users, key, isBlocked, isSelf, isAdmin, block);
                }
            }    
        }

        return HTMLOutput;
    }

    kickUsers(members, invitedUsers, isAdmin, config, teamId, individualUserId) {
        const userId = this.helpers.GET_USER_ID();
        return new Promise((resolve, reject) => {
            this.helpers.SALT().then((salt) => {
                const decrypt = this.encryptDependencies.decipher(salt);
                const decryptedSelfId = decrypt(userId);
                const decryptedId = decrypt(individualUserId);
                const dbRef = this.helpers.GET_DB_REFERENCE();

                this.helpers.GET_DB_USERS_INFO(dbRef, decryptedId).then((getLoggedInUser) => {
                    this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamId).then((getTeam) => {
                        try {
                            if (this.helpers.IF_EXISTS(getTeam) && this.helpers.IF_EXISTS(getLoggedInUser)) {
                                const team = this.helpers.GET_VALUE(getTeam);
                                const loggedInUser = this.helpers.GET_VALUE(getLoggedInUser);

                                const canKick = this.#checkIfUserCanBeKicked(decryptedId, members, invitedUsers, isAdmin, decryptedSelfId, config, team, loggedInUser);
                                if (canKick === true) {
                                    resolve(alert('yes'));
                                }
                            } else {
                                reject(this.handlerDependencies.throwError("No data available!"));
                            }
                        } catch(error) {
                            reject(this.handlerDependencies.displayMessage({message: error, isError: true}));
                        }
                    });
                });
            });
        });
    }

    #checkIfUserCanBeKicked(userId, members, invitedUsers, isAdmin, selfId, config, team, loggedInUser) {    
        const teamAdmin = team.teamCreatorId;
        if (userId === teamAdmin){
            return false;
        }
        if (userId === selfId) {
            return false;
        }
        if (isAdmin === true) {
            return true;
        }
        const blockedUsers = loggedInUser.blockedUsers;
        for (const key in blockedUsers) { 
            if (selfId === blockedUsers[key]) {
                return false;
            }
        }
        if (config.allAllowedToRemoveUsers === true) {
            for(let i = 0; i < members.length; i++) {
                if (members[i] === userId) {
                    return true;
                }
            }
        }
        if (config.allAllowedToRemovePendingInvites === true) {
            for(let i = 0; i < invitedUsers.length; i++) {
                if (invitedUsers[i] === userId) {
                    return true;
                }
            }
        }
        return false;
    }

}