import { HandlerController } from '../controller/handlers/handlerController.js';
import { SignInController } from '../controller/signedOut/signInController.js';
import { FORMAT_ERROR_MESSAGE, GET_AUTH } from '../helpers/helpers.js';

const handlerController = new HandlerController();

export class PasswordResetModel {

    resetPassword(email) {
        GET_AUTH.sendPasswordResetEmail(email).then(() => {
            handlerController.displayMessage({message: `An email has been sent to <span style="font-weight: bold;">${email}</span>!<br>Please check your spam folder if you can't find it`, isError: false});

            const signInController = new SignInController();
            signInController.setView();
        }).catch((error) => {
            const formattedErrorMessage = FORMAT_ERROR_MESSAGE(error);
            handlerController.displayMessage({message: `Entered email: <span style="font-weight: bold;">${email}</span><br><br>` + formattedErrorMessage, isError: true});
        });
    }

}