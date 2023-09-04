import { ErrorController } from '../controller/errorController.js';
import { SuccessController } from '../controller/successController.js';
import { FORMAT_ERROR_MESSAGE } from '../helpers/helpers.js';

const errorController = new ErrorController();

export class PasswordResetModel {

    resetPassword(email) {
        firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            const successController = new SuccessController();
            successController.displaySuccessMessage(`An email has been sent to <span style="font-weight: bold;">${email}</span>!<br>Please check your spam folder if you can't find it`);
        })
        .catch((error) => {
            const formattedErrorMessage = FORMAT_ERROR_MESSAGE(error);
            errorController.displayErrorMessage(`Entered email: <span style="font-weight: bold;">${email}</span><br><br>` + formattedErrorMessage);
        });
    }

}