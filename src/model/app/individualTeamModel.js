export class IndividualTeamModel {

    constructor(authDependencies, loadDependencies, handlerDependencies, encryptDependencies, helpers, views, individualUserModel) {
        this.authDependencies = authDependencies;
        this.loadDependencies = loadDependencies;
        this.handlerDependencies = handlerDependencies;
        this.encryptDependencies = encryptDependencies;
        this.helpers = helpers;
        this.views = views;
        this.individualUserModel = individualUserModel;
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

                                    const HTMLInvitedUsersOutput = this.#generateTeamUsersOutput(invitedUsers, users, encrypt, blockedUsers, loggedInUserId, allowedToRemovePending, teamAdmin);

                                    const countMembers = this.#countUsers(members, users);
                                    const countIvitedUsers = this.#countUsers(invitedUsers, users);

                                    this.loadDependencies.removeLoading();

                                    resolve([HTMLMembersOutput, HTMLInvitedUsersOutput, countMembers, countIvitedUsers]);
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

    #generateTeamUsersOutput(members, users, encrypt, blockedUsers, loggedInUserId, allowedToRemove, teamAdmin) {
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

                if (teamAdmin === loggedInUserId && key !== loggedInUserId) {block = false;}

                if (key === members[i]) {
                    const encryptedKey = encrypt(key);
                    const isBlocked = !this.helpers.CHECK_IF_BLOCKED_USERS_EXISTS(blockedUsers, key);

                    HTMLOutput += this.views.userOutputView(encryptedKey, users, key, isBlocked, isSelf, isAdmin, block);
                }
            }    
        }

        return HTMLOutput;
    }

    #countUsers(members, users) {
        let count = 0;

        for (let i = 0; i < members.length; i++) {
            for (const key in users) {
                if (key === members[i]) {count ++;}
            }
        }
        return count;
    }

    checkPermissionToKickUsers(members, invitedUsers, isAdmin, config, teamId, individualUserId) {
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
                                
                                resolve(canKick);
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

    toggleTeamConfiguration(teamId, configOption) {
        const dbRef = this.helpers.GET_DB_REFERENCE();

        return new Promise((resolve, reject) => {
            this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamId).then((getTeam) => {
                try {
                    if (this.helpers.IF_EXISTS(getTeam)) {
                        const team = this.helpers.GET_VALUE(getTeam);
                        const configElementToggle = this.#toggleConfigurationElement(configOption, team.configuration);

                        this.helpers.SAVE_TO_DB_IN_TEAMS_CONFIGURATION({
                            dbReference: dbRef,
                            firstChild: teamId,
                            secondChild: 'configuration',
                            thirdChild: configElementToggle.configOption,
                            saveValue: configElementToggle.value
                        });

                        this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamId).then((getUpdatedTeam) => {
                            if (this.helpers.IF_EXISTS(getUpdatedTeam)) {
                                const updatedTeam = this.helpers.GET_VALUE(getUpdatedTeam);
                                this.loadDependencies.removeLoading();
                                resolve(updatedTeam);
                            } else {
                                this.loadDependencies.removeLoading();
                                reject(this.handlerDependencies.throwError("No data available!"));
                            }
                        });
                    } else {
                        this.loadDependencies.removeLoading();
                        reject(this.handlerDependencies.throwError("No data available!"));
                    }
                } catch(error) {
                    reject(this.handlerDependencies.displayMessage({message: error, isError: true}));
                }
            });
        }
    )}

    #toggleConfigurationElement(configOption, config) {
        if (configOption === 'allowAddUsers') {
            const addUsersValue = config.allAllowedToAddUsers;
            return {configOption: 'allAllowedToAddUsers', value: !addUsersValue};
        }

        if (configOption === 'allowKickUsers') {
            const removeUsersValue = config.allAllowedToRemoveUsers;
            return {configOption: 'allAllowedToRemoveUsers', value: !removeUsersValue};
        }

        if (configOption === 'allowRemoveInvitedUsers') {
            const removePendingUsersValue = config.allAllowedToRemovePendingInvites;
            return {configOption: 'allAllowedToRemovePendingInvites', value: !removePendingUsersValue};
        }

        if (configOption === 'allowScheduleMeeting') {
            const scheduleMeetingValue = config.allAllowedToScheduleMeeting;
            return {configOption: 'allAllowedToScheduleMeeting', value: !scheduleMeetingValue};
        }
    }

    renameTeam(teamId, newName) {
        const dbRef = this.helpers.GET_DB_REFERENCE();

        return new Promise((resolve, reject) => {
            this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamId).then((getTeam) => {
                try {
                    if (this.helpers.IF_EXISTS(getTeam)) {
                        const team = this.helpers.GET_VALUE(getTeam);
                        const oldName = team.teamName;

                        this.helpers.SAVE_TO_DB_IN_TEAMS({
                            dbReference: dbRef,
                            firstChild: teamId,
                            secondChild: 'teamName',
                            saveValue: newName
                        });

                        this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamId).then((getUpdatedTeam) => {
                            if (this.helpers.IF_EXISTS(getUpdatedTeam)) {
                                const updatedTeam = this.helpers.GET_VALUE(getUpdatedTeam);

                                this.handlerDependencies.displayMessage({message: `You have change the name of <span style="font-weight: bold;">${oldName}</span> to <span style="font-weight: bold;">${newName}</span>!`, isError: false});

                                resolve(updatedTeam);
                            } else {
                                this.loadDependencies.removeLoading();
                                reject(this.handlerDependencies.throwError("No data available!"));
                            }
                        });
                    } else {
                        this.loadDependencies.removeLoading();
                        reject(this.handlerDependencies.throwError("No data available!"));
                    }
                } catch(error) {
                    reject(this.handlerDependencies.displayMessage({message: error, isError: true}));
                }
            });
        });
    }

    deleteTeam(teamId) {
        const dbRef = this.helpers.GET_DB_REFERENCE();

        return new Promise((resolve, reject) => {
            this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamId).then((getTeam) => {
                try {
                    if (this.helpers.IF_EXISTS(getTeam)) {
                        const team = this.helpers.GET_VALUE(getTeam);
                        const members = team.members;
                        const invitedUsers = Object.values(team.invitedUsers);

                        this.#removeAllUsersFromTeamFromDB(members, teamId);
                        this.#removeAllUsersFromTeamFromDB(invitedUsers, teamId, 'KICK');

                        resolve(this.#completeTeamDeletionFromDB(teamId));
                    } else {
                        this.loadDependencies.removeLoading();
                        reject(this.handlerDependencies.throwError("No data available!"));
                    }
                } catch(error) {
                    reject(this.handlerDependencies.displayMessage({message: error, isError: true}));
                }
            });
        });
    }

    #removeAllUsersFromTeamFromDB(users, teamId, kick = '') {
        for (let i = 0; i < users.length; i++) {
            this.individualUserModel.removeUserFromTeam(users[i], teamId, kick, true);
        }
    }

    #completeTeamDeletionFromDB(teamId) {
        return new Promise((resolve, reject) => {
            try {
                const dbRef = this.helpers.GET_DB_REFERENCE();
                this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamId).then((getTeam) => {
                    if (this.helpers.IF_EXISTS(getTeam)) {  
                        resolve(this.#removeTeamFromDB(teamId));
                    } else {
                        reject(this.handlerDependencies.throwError("No data available!"));
                    }
                });
            } catch(error) {
                reject(this.handlerDependencies.displayMessage({message: error, isError: true}));
            }
        });
    }

    #removeTeamFromDB(teamId) {
        const getCurrentTeam = this.helpers.GET_DB_REFERENCE(this.helpers.TEAMS_REF + teamId);
        getCurrentTeam.remove();
    }

}