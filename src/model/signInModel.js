import { ErrorController } from '../controller/errorController.js';
import { AuthHelper } from '../helpers/auth.js';
import { FORMAT_ERROR_MESSAGE, GET_AUTH } from '../helpers/helpers.js';

const errorController = new ErrorController();

export class SignInModel {

    signInUser(email, password) {
        const authHelper = new AuthHelper();

        GET_AUTH.signInWithEmailAndPassword(email, password).then((userCredential) => {
            authHelper.createToken(userCredential.user.uid, email, password);
        }).catch((error) => {
            const formattedErrorMessage = FORMAT_ERROR_MESSAGE(error);
            errorController.displayErrorMessage(formattedErrorMessage);
        });
    }

}