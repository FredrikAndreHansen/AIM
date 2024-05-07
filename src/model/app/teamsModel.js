export class TeamsModel {

    constructor(authDependencies, loadDependencies, handlerDependencies, encryptDependencies, helpers, views) {
        this.authDependencies = authDependencies;
        this.loadDependencies = loadDependencies;
        this.handlerDependencies = handlerDependencies;
        this.encryptDependencies = encryptDependencies;
        this.helpers = helpers;
        this.views = views;
    }

    async getTeams(inviteUserId = false) {
        this.authDependencies.validateIfLoggedIn();

        const currentUserId = this.helpers.GET_USER_ID();
        const dbRef = this.helpers.GET_DB_REFERENCE();

        return await new Promise((resolve, reject) => {

            this.helpers.SALT().then((salt) => {
                const decrypt = this.encryptDependencies.decipher(salt);
                const decryptedCurrentUserId = decrypt(currentUserId);

                let inviteUser = false;
                if (inviteUserId !== false) {inviteUser = decrypt(inviteUserId.userId);}

                this.helpers.GET_DB_USERS_INFO(dbRef, decryptedCurrentUserId).then((userTeams) => {
                    if (this.helpers.IF_EXISTS(userTeams)) {
                        this.helpers.GET_DB_TEAMS_INFO(dbRef).then((allTeams) => {
                            const [HTMLOutput, count] = this.#checkTeams(userTeams, allTeams, salt, inviteUser, decryptedCurrentUserId);

                            this.loadDependencies.removeLoading();

                            resolve([HTMLOutput, count]);
                        })
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

    #checkTeams(getUserTeams, allTeams, salt, inviteUser, decryptedCurrentUserId) {
        const user = this.helpers.GET_VALUE(getUserTeams);
        const sortTeams = user.configuration.sortTeams;

        let teams = this.helpers.GET_VALUE(allTeams);
        if (teams === null) {
            teams = {};
        }

        return this.#outputTeamsSorted({
            sort: sortTeams, 
            userTeams: Object.values(user.teams),
            getTeamInfo: Object.values(teams),
            getAllTeamsById: Object.keys(teams),
            encrypt: this.encryptDependencies.cipher(salt),
            inviteUser: inviteUser,
            currentUserId: decryptedCurrentUserId
        });
    }

    #outputTeamsSorted(outputObject) {
        const { sort, userTeams, getTeamInfo, getAllTeamsById, encrypt, inviteUser, currentUserId } = outputObject;
        let HTMLOutput = '';
        let count = 0;

        if (sort === true) {
            for(let i = 0; i < userTeams.length; i++) {
                for(let j = 0; j < getAllTeamsById.length; j++) {

                    if (this.#checkToOutputTeam(userTeams[i], getAllTeamsById[j], inviteUser, getTeamInfo[j], currentUserId)) {
                        const membersQuantity = getTeamInfo[j].members;
                        const memberCount = this.#countMembers(membersQuantity);

                        HTMLOutput += this.views.teamsOutputView({
                            encryptedKey: encrypt(getAllTeamsById[j]), 
                            team: getTeamInfo[j].teamName,
                            usersInTeam: memberCount
                        });
                        count++;
                    }
                }
            }
        } else {
            for(let i = userTeams.length; i > 0; i--) {
                for(let j = 0; j < getAllTeamsById.length; j++) {

                    if (this.#checkToOutputTeam(userTeams[i], getAllTeamsById[j], inviteUser, getTeamInfo[j], currentUserId)) {
                        const membersQuantity = getTeamInfo[j].members;
                        const memberCount = this.#countMembers(membersQuantity)

                        HTMLOutput += this.views.teamsOutputView({
                            encryptedKey: encrypt(getAllTeamsById[j]), 
                            team: getTeamInfo[j].teamName,
                            usersInTeam: memberCount
                        });
                        count++;
                    }
                }
            }
        }

        if (count === 0) {
            HTMLOutput = this.views.noTeams(inviteUser);
        }

        return [HTMLOutput, count];
    }

    #countMembers(members) {
        let count = 0;

        for (let i = 0; i < members.length; i++) {
            if (members[i]) {count ++;}
        }

        return count;
    }

    #checkToOutputTeam(userTeams, getAllTeamsById, inviteUser, getTeamInfo, currentUserId) {
        if(userTeams === getAllTeamsById) {

            const allInvitedUsers = Object.entries(getTeamInfo.invitedUsers);
            for (const [_, invitedUsers] of allInvitedUsers) {
                if (invitedUsers === inviteUser) {
                    return false;
                }
            }

            for (let i = 0; i < getTeamInfo.members.length; i++) {
                if (getTeamInfo.members[i] === inviteUser) {
                    return false;
                }
            }

            if(inviteUser === false) {
                return true;
            }

            if(inviteUser !== false && getTeamInfo.configuration.allAllowedToAddUsers === true) {
                return true;
            }

            if(inviteUser !== false && getTeamInfo.teamCreatorId === currentUserId) {
                return true;
            }
        } else {
            return false;
        }
        return false;
    }

    addTeam(teamName) {
        this.authDependencies.validateIfLoggedIn();

        const currentUserId = this.helpers.GET_USER_ID();
        const dbRef = this.helpers.GET_DB_REFERENCE();

        return new Promise((resolve, reject) => {

            this.helpers.SALT().then((salt) => {
                const decrypt = this.encryptDependencies.decipher(salt);
                const decryptedCurrentUserId = decrypt(currentUserId);
            
                this.helpers.GET_DB_USERS_INFO(dbRef, decryptedCurrentUserId).then((snapshot) => {
                    this.helpers.GLOBAL_CONFIG('CONTACT_URL').then((url) => {
                        this.helpers.GLOBAL_CONFIG('MAXIMUM_TEAMS_PER_PERSON').then((MAXIMUM_TEAMS_PER_PERSON) => {
                            this.#countTeamsCreated(decryptedCurrentUserId).then((allTeams) => {
                                if (this.helpers.IF_EXISTS(snapshot)) {
                                    const userData = this.helpers.GET_VALUE(snapshot);
                                    const isUserSubscribed = userData.configuration.isSubscribed;
                                    if (this.#checkHasPermissionToCreateTeam(isUserSubscribed, MAXIMUM_TEAMS_PER_PERSON, allTeams)) {
                                        this.loadDependencies.removeLoading();

                                        this.handlerDependencies.displayMessage({message: `<span style="font-weight: bold;">${teamName}</span> was successfully created!`, isError: false});

                                        resolve(this.#pushNewTeamToDB(decryptedCurrentUserId, teamName, isUserSubscribed));   
                                    } else {
                                        this.loadDependencies.removeLoading();

                                        reject(this.handlerDependencies.throwError(`You have reached the limit of maximum teams! <a href="${url}" target="_blank">Contact us for more information</a>`));
                                    }
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
            });
        });
    }

    #checkHasPermissionToCreateTeam(isUserSubscribed, MAXIMUM_TEAMS_PER_PERSON, allTeams) {
        if (isUserSubscribed === true) {
            return true;
        } else {
            if (allTeams < MAXIMUM_TEAMS_PER_PERSON) {
                return true;
            } else {
                return false;
            }
        }
    }

    #pushNewTeamToDB(userId, teamName, isUserSubscribed) {
        const dbRef = this.helpers.GET_DB_REFERENCE();
        const addTeam = dbRef.child(this.helpers.TEAMS_GET_CHILD_REF).push({
            teamCreatorId: userId,
            teamName: teamName, 
            members: [userId],
            invitedUsers: [""],
            configuration: {
                allAllowedToAddUsers: true,
                allAllowedToRemoveUsers: false,
                allAllowedToRemovePendingInvites: false,
                allAllowedToScheduleMeeting: true
            },
            isAdminSubscribed: isUserSubscribed
        });
        const getKey = addTeam.getKey();
        const addTeamToUser = dbRef.child(this.helpers.USERS_GET_CHILD_REF).child(userId).child(this.helpers.TEAMS_GET_CHILD_REF).push(getKey);

        return addTeamToUser;
    }

    toggleTeamsSort() {
        this.authDependencies.validateIfLoggedIn();

        const currentUserId = this.helpers.GET_USER_ID();
        const dbRef = this.helpers.GET_DB_REFERENCE();

        return new Promise((resolve, reject) => {
            this.helpers.SALT().then((salt) => {
                try {
                    const decrypt = this.encryptDependencies.decipher(salt);
                    const decryptedCurrentUserId = decrypt(currentUserId);

                    this.helpers.GET_DB_USERS_INFO(dbRef, decryptedCurrentUserId).then((userData) => {
                        if (this.helpers.IF_EXISTS(userData)) {
                            const user = this.helpers.GET_VALUE(userData);
                            const sortTeams = user.configuration.sortTeams;

                            resolve(
                                this.helpers.SAVE_TO_DB_IN_USERS_CONFIG({
                                    dbReference: dbRef,
                                    firstChild: decryptedCurrentUserId,
                                    secondChild: 'sortTeams',
                                    saveValue: !sortTeams
                                })
                            );
                        } else {
                            reject(this.handlerDependencies.throwError("No data available!"));
                        }
                    });
                } catch(error) {
                    reject(this.handlerDependencies.displayMessage({message: error, isError: true}));
                }
            });
        });
    }

    getSortTeamsObjectData() {
        this.authDependencies.validateIfLoggedIn();

        const currentUserId = this.helpers.GET_USER_ID();
        const dbRef = this.helpers.GET_DB_REFERENCE();

        return new Promise((resolve, reject) => {
            this.helpers.SALT().then((salt) => {
                try {
                    const decrypt = this.encryptDependencies.decipher(salt);
                    const decryptedCurrentUserId = decrypt(currentUserId);

                    this.helpers.GET_DB_USERS_INFO(dbRef, decryptedCurrentUserId).then((userData) => {
                        if (this.helpers.IF_EXISTS(userData)) {
                            const user = this.helpers.GET_VALUE(userData);
                            const sortTeams = user.configuration.sortTeams;

                            resolve(sortTeams);
                        } else {
                            reject(this.handlerDependencies.throwError("No data available!"));
                        }
                    });
                } catch(error) {
                    reject(this.handlerDependencies.displayMessage({message: error, isError: true}));
                }
            });
        });
    }

    #countTeamsCreated(user) {
        const dbRef = this.helpers.GET_DB_REFERENCE();

        return new Promise((resolve) => {
            this.helpers.GET_DB_TEAMS_INFO(dbRef).then((getAllTeams) => {
                let count = 0;
                if (this.helpers.IF_EXISTS(getAllTeams)) {
                    const allTeams = this.helpers.GET_VALUE(getAllTeams);

                    for (const team of Object.entries(allTeams)) {
                        if (team[1].teamCreatorId === user) {
                            count++;
                        }
                    }
                    resolve(count)
                } else {
                    resolve(count);
                }
            });
        });
    }

}