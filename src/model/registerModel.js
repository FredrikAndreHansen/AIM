import { ErrorController } from '../controller/errorController.js';
import { SignInModel } from './signInModel.js';
import { FORMAT_ERROR_MESSAGE, GET_DB_REFERENCE, GET_AUTH } from '../helpers/helpers.js';

const errorController = new ErrorController();

export class RegisterModel {

    registerUser(userData) {
        const { name, email, company, password } = userData;
        
        GET_AUTH.createUserWithEmailAndPassword(email, password).then((userCredential) => {
            const signInModel = new SignInModel();
            const user = userCredential.user;
            
            this.#writeUserData({
                userId: user.uid, 
                name: name, 
                company: company, 
                teams: [""], 
                blockedUsers: [""]
            });

            signInModel.signInUser(email, password);
        }).catch((error) => {
            const formattedErrorMessage = FORMAT_ERROR_MESSAGE(error);
            errorController.displayErrorMessage(formattedErrorMessage);
        });
    }

    #writeUserData(userData) {
        const { userId, name, company, teams, blockedUsers } = userData;

        const dbRef = GET_DB_REFERENCE('users/' + userId);

        dbRef.set({
            username: name,
            company: company,
            teams: teams,
            blockedUsers: blockedUsers
        });
    }

}