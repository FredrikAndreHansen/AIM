import { AppController } from '../appController.js';

export class UsersController extends AppController {

    setView() {
        this.#usersMenuHighlight();
        
        this.allUsersController.setView();
    }

    #usersMenuHighlight() {
        const mainMenuUsersDOMElement = document.querySelector('#main-menu-users');
        this._helpers.SET_MENU_HIGHLIGHT(mainMenuUsersDOMElement);
    }

}