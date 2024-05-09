import { OfflineController } from "../controller/offlineController.js";
import { IndexController } from "../controller/app/indexController.js";
import { UsersController } from "../controller/app/usersController.js";
import { TeamsController } from "../controller/app/teamsController.js";
import { MeetingController } from "../controller/app/meetingController.js";
import { SignInController } from "../controller/signedOut/signInController.js"
import { RegisterController } from "../controller/signedOut/registerController.js";
import { PasswordResetController } from "../controller/signedOut/passwordResetController.js";
import { AppController } from "../controller/appController.js";
import { SignedOutController } from "../controller/signedOutController.js";
import { HAS_INTERNET_CONNECTION } from "../helpers/helpers.js";
import { displayLoading } from "./load.js";

export function initApp(navigate, teamsInfo = false, settings = false, inviteUsersToTeam = false) {
    const appController = createAppController();

    appController.init(navigate, teamsInfo, settings, inviteUsersToTeam);
 }

 function createAppController() {
    const indexController = new IndexController();
    const usersController = new UsersController();
    const teamsController = new TeamsController();
    const meetingController = new MeetingController();

    return new AppController(
        indexController, 
        usersController,
        teamsController,
        meetingController
    );
}

export function initSignedOut(navigate) {
    const signedOutController = createSignedOutController();

    signedOutController.init(navigate);
}

function createSignedOutController() {
    const signInController = new SignInController();
    const registerController = new RegisterController();
    const passwordResetController = new PasswordResetController();

    return new SignedOutController(
        signInController, 
        registerController,
        passwordResetController
    );
}

export function initOffline() {
    displayLoading();

    setTimeout(() => {
        if (!HAS_INTERNET_CONNECTION()) {
            const offlineController = new OfflineController();
            offlineController.setView();
        }
    }, 2000);
}