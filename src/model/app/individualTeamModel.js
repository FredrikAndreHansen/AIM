export class IndividualTeamModel {

    constructor(authDependencies, loadDependencies, handlerDependencies, helpers) {
        this.authDependencies = authDependencies;
        this.loadDependencies = loadDependencies;
        this.handlerDependencies = handlerDependencies;
        this.helpers = helpers;
    }

    async getIndividualTeam(teamId) {
        this.authDependencies.validateIfLoggedIn();

        const dbRef = this.helpers.GET_DB_REFERENCE();
  
        return await new Promise((resolve, reject) => {

            this.helpers.GET_DB_INDIVIDUAL_TEAM_INFO(dbRef, teamId).then((snapshot) => {

                if (this.helpers.IF_EXISTS(snapshot)) {
                    const team = this.helpers.GET_VALUE(snapshot);
                    this.loadDependencies.removeLoading();

                    resolve(team);
                } else {
                    this.loadDependencies.removeLoading();
                    reject(this.handlerDependencies.throwError("No data available!"));
                }
            }).catch((error) => {
                this.loadDependencies.removeLoading();
                this.handlerDependencies.displayMessage({message: error, isError: true});
            });
        });
    }

}