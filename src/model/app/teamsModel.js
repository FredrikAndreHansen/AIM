export class TeamsModel {

    constructor(authDependencies, loadDependencies, handlerDependencies, encryptDependencies, helpers, views) {
        this.authDependencies = authDependencies;
        this.loadDependencies = loadDependencies;
        this.handlerDependencies = handlerDependencies;
        this.encryptDependencies = encryptDependencies;
        this.helpers = helpers;
        this.views = views;
    }

    async getTeams() {
        this.authDependencies.validateIfLoggedIn();

        const currentUserId = this.helpers.GET_USER_ID();
        const dbRef = this.helpers.GET_DB_REFERENCE();

        return await new Promise((resolve, reject) => {

            this.helpers.SALT().then((salt) => {
                const decrypt = this.encryptDependencies.decipher(salt);
                const decryptedCurrentUserId = decrypt(currentUserId);

                this.helpers.GET_DB_USERS_INFO(dbRef, decryptedCurrentUserId).then((userTeams) => {
                    if (this.helpers.IF_EXISTS(userTeams)) {
                        this.helpers.GET_DB_TEAMS_INFO(dbRef).then((allTeams) => {
                            const HTMLOutput = this.#checkTeams(userTeams, allTeams, salt);

                            this.loadDependencies.removeLoading();

                            resolve(HTMLOutput);
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

    #checkTeams(getUserTeams, allTeams, salt) {
        const user = this.helpers.GET_VALUE(getUserTeams);
        const userTeams = Object.values(user.teams);

        const teams = this.helpers.GET_VALUE(allTeams);
        const getTeamInfo = Object.values(teams);
        const getAllTeamsById = Object.keys(teams);

        const encrypt = this.encryptDependencies.cipher(salt);

        let HTMLOutput = '';
        let isEmpty = true;

        for(let i = 0; i < userTeams.length; i++) {
            for(let ii = 0; ii < getAllTeamsById.length; ii++) {
                if (userTeams[i] === getAllTeamsById[ii]) {
                    HTMLOutput += this.views.teamsOutputView({
                        encryptedKey: encrypt(getAllTeamsById[ii]), 
                        team: getTeamInfo[ii][1],
                        usersInTeam: getTeamInfo[ii][2].length
                    });
                    isEmpty = false;
                }
            }
        }
        if (isEmpty === true) {
            HTMLOutput = this.views.noTeams;
        }

        return HTMLOutput;
    }

    async addTeam(teamName) {
        this.authDependencies.validateIfLoggedIn();

        const currentUserId = this.helpers.GET_USER_ID();
        const dbRef = this.helpers.GET_DB_REFERENCE();

        return await new Promise((resolve, reject) => {

            this.helpers.SALT().then((salt) => {
                const decrypt = this.encryptDependencies.decipher(salt);
                const decryptedCurrentUserId = decrypt(currentUserId);

                this.helpers.GET_DB_USERS_INFO(dbRef, decryptedCurrentUserId).then((snapshot) => {
                    if (this.helpers.IF_EXISTS(snapshot)) {
                        this.loadDependencies.removeLoading();

                        this.handlerDependencies.displayMessage({message: `<span style="font-weight: bold;">${teamName}</span> was successfully created!`, isError: false});

                        resolve(this.#pushNewTeamToDB(decryptedCurrentUserId, teamName));   
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

    #pushNewTeamToDB(userId, teamName) {
        const dbRef = this.helpers.GET_DB_REFERENCE();
        const addTeam = dbRef.child(this.helpers.TEAMS_GET_CHILD_REF).push([userId, teamName, [userId]]);
        const getKey = addTeam.getKey();
        const addTeamToUser = dbRef.child(this.helpers.USERS_GET_CHILD_REF).child(userId).child(this.helpers.TEAMS_GET_CHILD_REF).push(getKey);

        return addTeamToUser;
    }

}