export class IndexModel {

    constructor(loadDependencies, handlerDependencies, encryptDependencies, helpers, views) {
        this.loadDependencies = loadDependencies;
        this.handlerDependencies = handlerDependencies
        this.encryptDependencies = encryptDependencies;
        this.helpers = helpers;
        this.views = views;
    }

    async checkForTeamInvites() {
        const loggedInUser = this.helpers.GET_USER_ID();

        this.loadDependencies.displayLoading();

        return await new Promise((resolve, reject) => {

            this.helpers.SALT().then((salt) => {
                const decrypt = this.encryptDependencies.decipher(salt); 
                const decryptedUserId = decrypt(loggedInUser);
                const dbRef = this.helpers.GET_DB_REFERENCE();

                this.helpers.GET_DB_USERS_INFO(dbRef, decryptedUserId).then((snapshot) => {
                    try {
                        if (this.helpers.IF_EXISTS(snapshot)) {
                            this.loadDependencies.removeLoading();

                            const invitedTeams = this.helpers.GET_VALUE(snapshot);
                            const invitedTeamsValues = Object.values(invitedTeams.invitedTeams);
                            const invitedTeamsId = Object.keys(invitedTeams.invitedTeams);
                            const invitedTeamsLength = invitedTeamsValues.length - 1;
                            
                            const HTMLInvitedTeamsHeading = this.views.invitedUsersHeadingView(invitedTeamsLength);
                            const HTMLOutput = this.#generateInvitedTeamsOutput(invitedTeamsValues, invitedTeamsId);

                            if (invitedTeamsLength > 0) {
                                resolve([HTMLInvitedTeamsHeading + HTMLOutput, invitedTeamsLength]);
                            } else {
                                resolve(["", 0]);
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

    #generateInvitedTeamsOutput(invitedTeams, invitedTeamsId) {
        let HTMLOutput = '';

        for (let i = 0; i < invitedTeams.length; i++) {
            if (invitedTeams[i].userWhoInvited === undefined || invitedTeams[i].userWhoInvited === null) { continue; }

            HTMLOutput += this.views.invitedUsersView({
                userName: invitedTeams[i].userWhoInvited, 
                teamName: invitedTeams[i].teamName, 
                teamId: invitedTeams[i].teamId, 
                inviteId: invitedTeamsId[i]});
        }

        return HTMLOutput;
    }

    acceptTeamInvitation(ids) {
        const { teamId, _ } = ids;

        this.#addUserToTeam(teamId);

        this.removeTeamInvitation(ids);
    }

    async #addUserToTeam(teamId) {
        const loggedInUser = this.helpers.GET_USER_ID();

        this.loadDependencies.displayLoading();

        return await new Promise((resolve, reject) => {

            this.helpers.SALT().then((salt) => {
                const decrypt = this.encryptDependencies.decipher(salt);
                const decryptedUserId = decrypt(loggedInUser);

                const dbRef = this.helpers.GET_DB_REFERENCE();

                this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamId).then((snapshot) => {
                    try {
                        if (this.helpers.IF_EXISTS(snapshot)) {
                            const team = this.helpers.GET_VALUE(snapshot);
                            const teamName = team.teamName;
  
                            resolve(
                                this.#saveToDB({
                                    dbRef: dbRef, 
                                    teamId: teamId, 
                                    members: team.members, 
                                    userId: decryptedUserId
                                })
                            );

                            this.loadDependencies.removeLoading();

                            this.handlerDependencies.displayMessage({message: `You have joined <span style="font-weight: bold">${teamName}</span>!`, isError: false})
                        } else {
                            this.handlerDependencies.throwError("No data available!");
                        }
                    } catch(error) {
                        this.loadDependencies.removeLoading();
                        reject(this.handlerDependencies.displayMessage({message: error, isError: true}));
                    }
                });       
            });
        });
    }

    #saveToDB(userInfo) {
        const { dbRef, teamId, members, userId } = userInfo;

        members.push(userId);

        this.helpers.SAVE_TO_DB_IN_TEAMS({
            dbReference: dbRef,
            firstChild: teamId,
            secondChild: 'members',
            saveValue: members
        });

        dbRef.child(this.helpers.USERS_GET_CHILD_REF).child(userId).child('teams').push(teamId);
    }

    removeTeamInvitation(ids) {
        const { teamId, invitedId } = ids;

        this.#removeInviteFromUser(invitedId);

        this.#removeUserFromTeam(teamId);
    }

    async #removeInviteFromUser(invitedId) {
        const loggedInUser = this.helpers.GET_USER_ID();

        this.loadDependencies.displayLoading();

        return await new Promise((resolve, reject) => {

            this.helpers.SALT().then((salt) => {
                try {
                    const decrypt = this.encryptDependencies.decipher(salt); 
                    const decryptedUserId = decrypt(loggedInUser);
                    const invitedTeam = this.helpers.GET_DB_REFERENCE(this.helpers.USERS_REF + decryptedUserId + "/invitedTeams/" + invitedId);

                    this.loadDependencies.removeLoading();

                    resolve(invitedTeam.remove());
                } catch(error) {
                    this.loadDependencies.removeLoading();
                    reject(this.handlerDependencies.displayMessage({message: error, isError: true}));
                }
            });
        });
    }

    async #removeUserFromTeam(teamId) {
        const loggedInUser = this.helpers.GET_USER_ID();

        this.loadDependencies.displayLoading();

        return await new Promise((resolve, reject) => {

            this.helpers.SALT().then((salt) => {

                const decrypt = this.encryptDependencies.decipher(salt); 
                const decryptedUserId = decrypt(loggedInUser);

                const dbRef = this.helpers.GET_DB_REFERENCE();

                this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamId).then((snapshot) => {
                    try {
                        if (this.helpers.IF_EXISTS(snapshot)) {
                            const invitedUser = this.helpers.GET_VALUE(snapshot);
                            
                            let getValue = false;
                            for (const [key, value] of Object.entries(invitedUser.invitedUsers)) {
                                if (decryptedUserId === value) {
                                    this.loadDependencies.removeLoading();

                                    getValue = true;

                                    const invitedTeam = this.helpers.GET_DB_REFERENCE(this.helpers.TEAMS_REF + teamId + "/invitedUsers/" + key);
                                    resolve(invitedTeam.remove());
                                }
                            }
                            if (getValue === false) {
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

}