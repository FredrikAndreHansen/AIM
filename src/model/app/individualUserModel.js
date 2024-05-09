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

            this.#setIsAdminSubscribed(teamInfo);

            this.helpers.SALT().then((salt) => {
                const decrypt = this.encryptDependencies.decipher(salt);
                const encryptedUserId = decrypt(userId);
                const encryptedLoggedInUserId = decrypt(loggedInUser);

                const dbRef = this.helpers.GET_DB_REFERENCE();

                this.helpers.GET_DB_USERS_INFO(dbRef, encryptedUserId).then((snapshot) => {
                    this.helpers.GET_DB_USERS_INFO(dbRef, encryptedLoggedInUserId).then((getUserLoggedIn) => {
                        this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamInfo.teamId).then((teamSnapshot) => {
                            this.helpers.GLOBAL_CONFIG('CONTACT_URL').then((url) => {
                                this.helpers.GLOBAL_CONFIG('MAXIMUM_PEOPLE_PER_TEAM').then((MAXIMUM_PEOPLE_PER_TEAM) => {
                                    try{
                                        if(this.#checkIfUserIsAlreadyInTeam(teamSnapshot, encryptedUserId)) {
                                            if (this.helpers.IF_EXISTS(snapshot) && this.helpers.IF_EXISTS(getUserLoggedIn) && this.helpers.IF_EXISTS(teamSnapshot)) {
                                                if(this.#checkIfUserCanBeInvited(teamSnapshot, MAXIMUM_PEOPLE_PER_TEAM)) {
                                                    const getUserLoggedInValue = this.helpers.GET_VALUE(getUserLoggedIn);

                                                    const getUserLoggedInName = getUserLoggedInValue.username;
                        
                                                    this.handlerDependencies.displayMessage({message: `You have invited <span style="font-weight: bold">${userName}</span> to join <span style="font-weight: bold">${teamInfo.teamName}</span>!`, isError: false});

                                                    resolve(this.#pushNewUserInviteToDB(dbRef, encryptedUserId, getUserLoggedInName, teamInfo));
                                                } else {
                                                    reject(this.handlerDependencies.throwError(`You have reached the limit of maximum users! <a href="${url}" target="_blank">Contact us for more information</a>`));
                                                }
                                            } else {
                                                reject(this.handlerDependencies.throwError("No data available!"));
                                            }
                                        } else {
                                            reject(this.handlerDependencies.throwError("Something went wrong, please try again later!"));
                                        }
                                    } catch(error) {
                                        this.handlerDependencies.displayMessage({message: error, isError: true});
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    #checkIfUserCanBeInvited(teamSnapshot, MAXIMUM_PEOPLE_PER_TEAM) {
        const team = this.helpers.GET_VALUE(teamSnapshot);

        const isAdminSubscribed = team.isAdminSubscribed;
        const allTeamUsers = this.#countAllTeamUsers(team);
        
        if (isAdminSubscribed === true) {
            return true;
        } else if (allTeamUsers < MAXIMUM_PEOPLE_PER_TEAM) {
            return true;
        } else {
            return false;
        }
    }

    #checkIfUserIsAlreadyInTeam(teamSnapshot, userId) {
        const team = this.helpers.GET_VALUE(teamSnapshot);
        const invitedUsers = Object.entries(team.invitedUsers);

        for (const [_, invitedUsierId] of invitedUsers) {
            if (invitedUsierId === userId) {
                return false;
            }
        }

        const members = team.members;
        for (let i = 0; i < members.length; i++) {
            if (members[i] === userId) {
                return false;
            }
        }

        return true;
    }

    #setIsAdminSubscribed(teamInfo) {
        const dbRef = this.helpers.GET_DB_REFERENCE();
        try {
            this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamInfo.teamId).then((teamSnapshot) => {
                const team = this.helpers.GET_VALUE(teamSnapshot);
                this.helpers.GET_DB_USERS_INFO(dbRef, team.teamCreatorId).then((adminSnapshot) => {
                    const admin = this.helpers.GET_VALUE(adminSnapshot);
                    if (admin.configuration.isSubscribed !== team.isAdminSubscribed) {
                        this.helpers.SAVE_TO_DB_IN_TEAMS({
                            dbReference: dbRef,
                            firstChild: teamInfo.teamId,
                            secondChild: 'isAdminSubscribed',
                            saveValue: admin.configuration.isSubscribed
                        });
                    }
                })
            });
        } catch(error) {
            this.handlerDependencies.displayMessage({message: error, isError: true});
        }
    }

    #countAllTeamUsers(team) {
        const members = team.members.length;
        const invitedUsers = Object.values(team.invitedUsers);

        let invitedUsersCount = 0;
        for(let i = 0; i < invitedUsers.length; i++) {
            if(invitedUsers[i]) {invitedUsersCount++;}
        }

        return members + invitedUsersCount;
    }

    #pushNewUserInviteToDB(dbRef, encryptedUserId, getUserLoggedInName, teamInfo) {
        dbRef.child(this.helpers.USERS_GET_CHILD_REF).child(encryptedUserId).child('invitedTeams').push({
            teamId: teamInfo.teamId,
            teamName: teamInfo.teamName,
            userWhoInvited: getUserLoggedInName
        });

        dbRef.child(this.helpers.TEAMS_GET_CHILD_REF).child(teamInfo.teamId).child('invitedUsers').push(encryptedUserId);
    }

    removeUserFromTeam(userId, teamId, message, teamDeletion = false) {
        this.loadDependencies.displayLoading();

        return new Promise((resolve, reject) => {
            const dbRef = this.helpers.GET_DB_REFERENCE();

            this.helpers.SALT().then((salt) => {
                const decrypt = this.encryptDependencies.decipher(salt);
                if (userId === false) {
                    userId = this.helpers.GET_USER_ID();
                    const encryptedUserId = decrypt(userId);
                    userId = encryptedUserId;
                }

                this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamId).then((snapshotTeam) => {
                    this.helpers.GET_DB_USERS_INFO(dbRef, userId).then((snapshotUser) => {
                        try {
                            if (this.helpers.IF_EXISTS(snapshotTeam) && this.helpers.IF_EXISTS(snapshotUser)) {
                                const getUser = this.helpers.GET_VALUE(snapshotTeam);
                                const getTeam = this.helpers.GET_VALUE(snapshotUser);

                                if (message === 'KICK') {message = `You have kicked <span style="font-weight: bold">${getTeam.username}</span> from <span style="font-weight: bold">${getUser.teamName}</span>!`}

                                const removeUser = this.#removeUserFromTeamDB(getUser, userId, teamId);
                                const removeTeam = this.#removeTeamFromUserDB(getTeam, userId, teamId);

                                if (removeUser === true && removeTeam === true) {
                                    this.loadDependencies.removeLoading();
                                    if (teamDeletion === false && message !== false) {
                                        this.handlerDependencies.displayMessage({message: message, isError: false});
                                    }
                                    resolve();
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