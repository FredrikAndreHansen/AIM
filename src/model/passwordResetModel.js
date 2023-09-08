import { ErrorController } from '../controller/errorController.js';
import { SuccessController } from '../controller/successController.js';
import { SignInController } from '../controller/signInController.js';
import { FORMAT_ERROR_MESSAGE, GET_AUTH } from '../helpers/helpers.js';

const errorController = new ErrorController();

export class PasswordResetModel {

    resetPassword(email) {
        GET_AUTH.sendPasswordResetEmail(email).then(() => {
            const successController = new SuccessController();
            successController.displaySuccessMessage(`An email has been sent to <span style="font-weight: bold;">${email}</span>!<br>Please check your spam folder if you can't find it`);

            const signInController = new SignInController();
            signInController.setView();
        }).catch((error) => {
            const formattedErrorMessage = FORMAT_ERROR_MESSAGE(error);
            errorController.displayErrorMessage(`Entered email: <span style="font-weight: bold;">${email}</span><br><br>` + formattedErrorMessage);
        });
    }

}