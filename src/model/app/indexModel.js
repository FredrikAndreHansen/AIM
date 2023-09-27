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
                            const invitedTeamsLength = invitedTeamsValues.length - 1;
                            const HTMLInvitedTeamsHeading = this.views.invitedUsersHeadingView(invitedTeamsLength);
                            const HTMLOutput = this.#generateInvitedTeamsOutput(invitedTeamsValues);

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

    #generateInvitedTeamsOutput(invitedTeams) {
        let HTMLOutput = '';

        for (let i = 0; i < invitedTeams.length; i++) {
            if (invitedTeams[i].userWhoInvited === undefined || invitedTeams[i].userWhoInvited === null) { continue; }
    
            HTMLOutput += this.views.invitedUsersView(invitedTeams[i].userWhoInvited, invitedTeams[i].teamName);
        }

        return HTMLOutput;
    }

}