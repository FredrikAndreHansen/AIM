export class SignInModel {

    constructor(handlerDependencies, authDependencies, helpers) {
        this.handlerDependencies = handlerDependencies;
        this.authDependencies = authDependencies;
        this.helpers = helpers;
    }

    signInUser(email, password) {
        this.helpers.GET_AUTH.signInWithEmailAndPassword(email, password).then((userCredential) => {
            this.authDependencies.createToken(userCredential.user.uid, email, password);
        }).catch((error) => {
            const formattedErrorMessage = this.helpers.FORMAT_ERROR_MESSAGE(error);
            this.handlerDependencies.displayMessage({message: formattedErrorMessage, isError: true});
        });
    }

}