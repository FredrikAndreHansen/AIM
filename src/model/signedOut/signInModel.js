import { HandlerController } from '../../controller/handlers/handlerController.js';
import { AuthHelper } from '../../helpers/auth.js';
import { FORMAT_ERROR_MESSAGE, GET_AUTH } from '../../helpers/helpers.js';

const handlerController = new HandlerController();

export class SignInModel {

    signInUser(email, password) {
        GET_AUTH.signInWithEmailAndPassword(email, password).then((userCredential) => {
            const authHelper = new AuthHelper();
            authHelper.createToken(userCredential.user.uid, email, password);
        }).catch((error) => {
            const formattedErrorMessage = FORMAT_ERROR_MESSAGE(error);
            handlerController.displayMessage({message: formattedErrorMessage, isError: true});
        });
    }

}