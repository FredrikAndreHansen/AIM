import { OfflineController } from "../controller/handlers/offlineController.js";
import { IndexController } from "../controller/app/indexController.js";
import { UsersController } from "../controller/app/usersController.js";
import { TeamsController } from "../controller/app/teamsController.js";
import { AppController } from "../controller/appController.js";
import { HAS_INTERNET_CONNECTION } from "../helpers/helpers.js";

export function initApp(navigate) {
    const appController = createAppController();

    appController.init(navigate);
 }

 function createAppController() {
    const indexController = new IndexController();
    const usersController = new UsersController();
    const teamsController = new TeamsController();

    return new AppController(
        indexController, 
        usersController,
        teamsController
    );
}

 export function initOffline() {
    setTimeout(() => {
        if (!HAS_INTERNET_CONNECTION()) {
            const offlineController = new OfflineController();
            offlineController.setView();
        }
    }, 2000);
}