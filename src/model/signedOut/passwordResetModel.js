export class PasswordResetModel {

    constructor(handlerDependencies, helpers) {
        this.handlerDependencies = handlerDependencies;
        this.helpers = helpers;
    }

    resetPassword(email) {
        this.helpers.GET_AUTH.sendPasswordResetEmail(email).then(() => {
            this.handlerDependencies.displayMessage({message: `An email has been sent to <span style="font-weight: bold;">${email}</span>!<br>Please check your spam folder if you can't find it`, isError: false});

            this.helpers.initSignedOut();
        }).catch((error) => {
            const formattedErrorMessage = this.helpers.FORMAT_ERROR_MESSAGE(error);
            this.handlerDependencies.displayMessage({message: `Entered email: <span style="font-weight: bold;">${email}</span><br><br>` + formattedErrorMessage, isError: true});
        });
    }

}