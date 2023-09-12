import { HandlerController } from '../../controller/handlers/handlerController.js';
import { SignInModel } from './signInModel.js';
import { FORMAT_ERROR_MESSAGE, GET_DB_REFERENCE, GET_AUTH, USERS_REF } from '../../helpers/helpers.js';

const handlerController = new HandlerController();

export class RegisterModel {

    registerUser(userData) {
        const { name, email, company, password } = userData;
        
        GET_AUTH.createUserWithEmailAndPassword(email, password).then((userCredential) => {
            const user = userCredential.user;
            
            this.#writeUserData({
                userId: user.uid, 
                name: name, 
                company: company, 
                teams: [""], 
                blockedUsers: [""]
            });

            const signInModel = new SignInModel();
            signInModel.signInUser(email, password);
        }).catch((error) => {
            const formattedErrorMessage = FORMAT_ERROR_MESSAGE(error);
            handlerController.displayMessage({message: formattedErrorMessage, isError: true});
        });
    }

    #writeUserData(userData) {
        const { userId, name, company, teams, blockedUsers } = userData;

        const dbRef = GET_DB_REFERENCE(USERS_REF + userId);

        dbRef.set({
            username: name,
            company: company,
            teams: teams,
            blockedUsers: blockedUsers
        });
    }

}