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
        const { userId, userName, blockUser } = userinfo;
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

                        this.handlerDependencies.displayMessage({message: `${userName} has been ${blockUser === false ? 'unblocked' : 'blocked'}!`, isError: false});
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

    async inviteUserToTeam(userId, userName, teamInfo) {
        const loggedInUser = this.helpers.GET_USER_ID();

        return await new Promise((resolve, reject) => {

            this.helpers.SALT().then((salt) => {
                const decrypt = this.encryptDependencies.decipher(salt);
                const encryptedUserId = decrypt(userId);
                const encryptedLoggedInUserId = decrypt(loggedInUser);

                const dbRef = this.helpers.GET_DB_REFERENCE();

                this.helpers.GET_DB_USERS_INFO(dbRef, encryptedUserId).then((snapshot) => {
                    this.helpers.GET_DB_USERS_INFO(dbRef, encryptedLoggedInUserId).then((getUserLoggedIn) => {
                        try{
                            if (this.helpers.IF_EXISTS(snapshot) && this.helpers.IF_EXISTS(getUserLoggedIn)) {
                                const getUserLoggedInValue = this.helpers.GET_VALUE(getUserLoggedIn);
                                const getUserLoggedInObject = Object.values(getUserLoggedInValue);
                                const getUserLoggedInName = getUserLoggedInObject[4];
    
                                this.handlerDependencies.displayMessage({message: `You have invited <span style="font-weight: bold">${userName}</span> to join <span style="font-weight: bold">${teamInfo.teamName}</span>!`, isError: false});

                                resolve(this.#pushNewUserInviteToDB(dbRef, encryptedUserId, getUserLoggedInName, teamInfo));
                            } else {
                                reject(this.handlerDependencies.throwError("No data available!"));
                            }
                        } catch(error) {
                            this.handlerDependencies.displayMessage({message: error, isError: true});
                        }
                    });
                });
            });
        });
    }

    #pushNewUserInviteToDB(dbRef, encryptedUserId, getUserLoggedInName, teamInfo) {
        dbRef.child(this.helpers.USERS_GET_CHILD_REF).child(encryptedUserId).child('invitedTeams').push({
            teamId: teamInfo.teamId,
            teamName: teamInfo.teamName,
            userWhoInvited: getUserLoggedInName
        });

        dbRef.child(this.helpers.TEAMS_GET_CHILD_REF).child(teamInfo.teamId).child('invitedUsers').push(encryptedUserId);
    }

    removeUserFromTeam(userId, teamId, message) {
        this.loadDependencies.displayLoading();

        return new Promise((resolve, reject) => {
            const dbRef = this.helpers.GET_DB_REFERENCE();

            this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamId).then((snapshotTeam) => {
                this.helpers.GET_DB_USERS_INFO(dbRef, userId).then((snapshotUser) => {
                    try {
                        if (this.helpers.IF_EXISTS(snapshotTeam) && this.helpers.IF_EXISTS(snapshotUser)) {
                            const getUser = this.helpers.GET_VALUE(snapshotTeam);
                            const getTeam = this.helpers.GET_VALUE(snapshotUser);

                            if (message === 'KICK') {message = `You have kicked <span style="font-weight: bold">${getTeam.username}</span> from <span style="font-weight: bold">${getUser.teamName}</span>!`} else {message = 'You have left <span style="font-weight: bold">${getUser.teamName}</span>!';}
                            
                            const removeUser = this.#removeUserFromTeamDB(getUser, userId, teamId);
                            const removeTeam = this.#removeTeamFromUserDB(getTeam, userId, teamId);

                            if (removeUser === true && removeTeam === true) {
                                this.loadDependencies.removeLoading();
                                resolve(this.handlerDependencies.displayMessage({message: message, isError: false}));
                            } else {
                                this.loadDependencies.removeLoading();
                                reject(this.handlerDependencies.throwError("No data available!"));
                            }
                        } else {
                            this.loadDependencies.removeLoading();
                            reject(this.handlerDependencies.throwError("No data available!"));
                        }
                    } catch(error) {
                        this.loadDependencies.removeLoading();
                        reject(this.handlerDependencies.displayMessage({message: error, isError: true}));
                    }
                });
            });
        });
    }

    #removeUserFromTeamDB(getUser, userId, teamId) {
        let foundUser = false;

        for (const [key, value] of Object.entries(getUser.invitedUsers)) {
            if (userId === value) {
                const invitedUser = this.helpers.GET_DB_REFERENCE(this.helpers.TEAMS_REF + teamId + '/invitedUsers/' + key);
                invitedUser.remove();
                foundUser = true;
            }
        }

        for (const [key, value] of Object.entries(getUser.members)) {
            if (userId === value) {
                const invitedUser = this.helpers.GET_DB_REFERENCE(this.helpers.TEAMS_REF + teamId + '/members/' + key);
                invitedUser.remove();
                foundUser = true;
            }
        }

        return foundUser;
    }

    #removeTeamFromUserDB(getTeam, userId, teamId) {
        let foundTeam = false;

        for (const [key, value] of Object.entries(getTeam.invitedTeams)) {
            if (teamId === value.teamId) {
                const invitedTeam = this.helpers.GET_DB_REFERENCE(this.helpers.USERS_REF + userId + '/invitedTeams/' + key);
                invitedTeam.remove();
                foundTeam = true;
            }
        }

        for (const [key, value] of Object.entries(getTeam.teams)) {
            if (teamId === value) {
                const invitedTeam = this.helpers.GET_DB_REFERENCE(this.helpers.USERS_REF + userId + '/teams/' + key);
                invitedTeam.remove();
                foundTeam = true;
            }
        }

        return foundTeam;
    }

}