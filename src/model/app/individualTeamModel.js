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

    async generateTeamUsers(members) {
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
                        try {
                            const loggedInUser = this.helpers.GET_VALUE(getLoggedInUser);
                            const blockedUsers = loggedInUser.blockedUsers;

                            const encrypt = this.encryptDependencies.cipher(salt);
                            const users = this.helpers.GET_VALUE(snapshot);

                            const HTMLMembersOutput = this.#generateTeamUsersOutput(members, users, encrypt, blockedUsers, loggedInUserId);

                            this.loadDependencies.removeLoading();

                            resolve([HTMLMembersOutput]);
                        } catch(error) {
                            this.loadDependencies.removeLoading();
                            reject(this.handlerDependencies.displayMessage({message: error, isError: true}));
                        }
                    });
                });
            });
        });
    }

    #generateTeamUsersOutput(members, users, encrypt, blockedUsers, loggedInUserId) {
        let HTMLOutput = "";

        for (let i = 0; i < members.length; i++) {
            for (const key in users) {

                let isSelf = false;
                if (key === loggedInUserId) {isSelf = true;}
    
                if (key === members[i]) {
                    const encryptedKey = encrypt(key);
                    const isBlocked = !this.helpers.CHECK_IF_BLOCKED_USERS_EXISTS(blockedUsers, key);

                    HTMLOutput += this.views.userOutputView(encryptedKey, users, key, isBlocked, isSelf);
                }
            }    
        }

        return HTMLOutput;
    }

}