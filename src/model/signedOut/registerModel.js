export class RegisterModel {

    constructor(handlerDependencies, helpers, signInModel) {
        this.handlerDependencies = handlerDependencies;
        this.helpers = helpers;
        this.signInModel = signInModel;
    }

    registerUser(userData) {
        const { name, email, company, password } = userData;
        
        this.helpers.GET_AUTH.createUserWithEmailAndPassword(email, password).then((userCredential) => {
            const user = userCredential.user;
            
            this.#writeUserData({
                userId: user.uid, 
                name: name, 
                company: company, 
                teams: [""], 
                blockedUsers: [""]
            });

            this.signInModel.signInUser(email, password);
        }).catch((error) => {
            const formattedErrorMessage = this.helpers.FORMAT_ERROR_MESSAGE(error);
            this.handlerDependencies.displayMessage({message: formattedErrorMessage, isError: true});
        });
    }

    #writeUserData(userData) {
        const { userId, name, company, teams, blockedUsers } = userData;

        const dbRef = this.helpers.GET_DB_REFERENCE(this.helpers.USERS_REF + userId);

        dbRef.set({
            username: name,
            company: company,
            teams: teams,
            blockedUsers: blockedUsers
        });
    }

}