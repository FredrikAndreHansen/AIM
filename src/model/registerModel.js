import { ErrorController } from '../controller/errorController.js';
import { SignInModel } from './signInModel.js';
import { FORMAT_ERROR_MESSAGE } from '../helpers/helpers.js';

const errorController = new ErrorController();

export class RegisterModel {

    registerUser(userData) {
        const { name, email, company, password } = userData;
        
        firebase.auth().createUserWithEmailAndPassword(email, password).then((userCredential) => {
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

        firebase.database().ref('users/' + userId).set({
            username: name,
            company: company,
            teams: teams,
            blockedUsers: blockedUsers
        });
    }

}