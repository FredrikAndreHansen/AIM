import { headerDOMElement } from "../index.js";
import { headerView } from "../view/handlers/headerView.js";
import { LoadController } from "./handlers/loadController.js";
import { HandlerController } from "./handlers/handlerController.js";
import { IndividualUserController } from "./app/individualUserController.js";
import { UsersModel } from "../model/app/usersModel.js";
import { IndividualUserModel } from "../model/app/individualUserModel.js";
import { TeamsModel } from "../model/app/teamsModel.js";
import { EncryptHelper } from "../helpers/encrypt.js";
import { AuthHelper } from "../helpers/auth.js";
import { SET_INNER_HTML_VALUE } from "../helpers/helpers.js";

export class AppController {

    constructor(
        indexController, 
        usersController,
        teamsController,
        handlerController = new HandlerController(),
        encryptHelper = new EncryptHelper(),
        loadController = new LoadController(),
        authHelper = new AuthHelper(handlerController, encryptHelper), 
        individualUserModel = new IndividualUserModel(authHelper, loadController, handlerController, encryptHelper),
        individualUserController = new IndividualUserController(handlerController, usersController, authHelper, individualUserModel),
        usersModel = new UsersModel(authHelper, loadController, handlerController, encryptHelper),
        teamsModel = new TeamsModel(authHelper, loadController, handlerController, encryptHelper)) { 
            this.indexController = indexController;
            this.usersController = usersController;
            this.teamsController = teamsController;
            this.handlerController = handlerController;
            this.encryptHelper = encryptHelper;
            this.usersModel = usersModel;
            this.authHelper = authHelper;
            this.loadController = loadController;
            this.individualUserModel = individualUserModel;
            this.individualUserController = individualUserController;
            this.teamsModel = teamsModel;
    }

    init(navigate = false) {
        this.#outputNavigation();

        if (navigate === false) {this.indexController.setView();}
        if (navigate === 'users') {this.usersController.setView();}
    }

    #outputNavigation() { 
        this.authHelper.validateIfLoggedIn();

        this.loadController.displayLoading();

        this.#generateOutput();
        
        this.#navigateToIndexPage();

        this.#navigateToUsersPage();

        this.#navigateToTeamsPage();

        this.#logOut();
    }

    #generateOutput() {
        return SET_INNER_HTML_VALUE({set: headerDOMElement, to: headerView(true)});
    }

    #navigateToIndexPage() {
        const mainMenuLogoDOMElement = document.querySelector('#main-menu-logo');

         mainMenuLogoDOMElement.addEventListener('click', () => {
            this.#outputNavigation();
            this.indexController.setView();
        }); 
    }

    #navigateToUsersPage() {
        const mainMenuUsersDOMElement = document.querySelector('#main-menu-users');

        mainMenuUsersDOMElement.addEventListener('click', () => {
            this.#outputNavigation();
            this.usersController.setView();
        });
    }

    #navigateToTeamsPage() {
        const mainMenuTeamsDOMElement = document.querySelector('#main-menu-teams');

        mainMenuTeamsDOMElement.addEventListener('click', () => {
            this.#outputNavigation();
            this.teamsController.setView();
        });
    }

    #logOut() {
        const mainMenuSignOutDOMElement = document.querySelector('#main-menu-sign-out');

        mainMenuSignOutDOMElement.addEventListener('click', () => {
            this.loadController.displayLoading();
            this.authHelper.removeToken();
        });
    }

}