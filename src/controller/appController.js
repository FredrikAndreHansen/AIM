import { headerDOMElement, viewDOMElement, popupDOMElement } from "../index.js";
import { headerView } from "../view/handlers/headerView.js";
import { indexView, invitedUsersHeadingView, invitedUsersView, noAlertsView, menuAlertsView } from "../view/app/indexView.js";
import { usersView, userOutputView, userSearchOutput } from "../view/app/usersView.js";
import { individualUserView } from "../view/app/individualUserView.js";
import { teamsView, teamsOutputView, noTeams } from "../view/app/teamsView.js";
import { individualTeamView, adminSettingsView } from "../view/app/individualTeamView.js";
import { IndividualUserController } from "./app/individualUserController.js";
import { IndividualTeamController } from "./app/individualTeamController.js";
import { AllUsersController } from "./app/allUsersController.js";
import { IndexModel } from "../model/app/indexModel.js";
import { UsersModel } from "../model/app/usersModel.js";
import { IndividualUserModel } from "../model/app/individualUserModel.js";
import { TeamsModel } from "../model/app/teamsModel.js";
import { displayLoading, removeLoading } from "../libraries/load.js";
import { displayMessage, throwError } from "../libraries/handler.js";
import { validateIfLoggedIn, removeToken, listenForUpdates } from "../helpers/auth.js";
import { cipher, decipher } from "../helpers/encrypt.js";
import { initApp } from "../libraries/init.js";
import { SET_INNER_HTML_VALUE, SALT, TRIMSTRING, PARSESTRING, GET_TOKEN, SET_MENU_HIGHLIGHT, GET_DOM_VALUE, ANIMATE_FADE_IN, VALIDATE_USER_INPUT, GET_DB_REFERENCE, GET_DB_USERS_INFO, IF_EXISTS, GET_VALUE, GET_USER_ID, CHECK_IF_BLOCKED_USERS_EXISTS, SAVE_TO_DB_IN_USERS, SAVE_TO_DB_IN_TEAMS, SAVE_TO_DB_IN_TEAMS_CONFIGURATION, CLOSE_MODAL, IF_ANY_BLOCKED_USERS, USERS_REF, TEAMS_REF, USERS_GET_CHILD_REF, TEAMS_GET_CHILD_REF, GET_DB_TEAMS_INFO, GET_DB_INDIVIDUAL_TEAM_INFO, GET_DB_ALL_USERS, CONVERT_STRING_TO_ARRAY, GET_DB_USERS_INVITEDTEAMS, DISABLE_SCROLL } from "../helpers/helpers.js";
import { IndividualTeamModel } from "../model/app/individualTeamModel.js";

export class AppController {

    _views = { viewDOMElement, indexView, invitedUsersHeadingView, invitedUsersView, noAlertsView, menuAlertsView, usersView, userOutputView, userSearchOutput, individualUserView, teamsView, teamsOutputView, noTeams, popupDOMElement, individualTeamView, adminSettingsView };
    _loadDependencies = { displayLoading, removeLoading };
    _handlerDependencies = { displayMessage, throwError };
    _authDependencies = { validateIfLoggedIn, removeToken, listenForUpdates };
    _encryptDependencies = { cipher, decipher };
    _helpers = { SET_INNER_HTML_VALUE, SALT, TRIMSTRING, PARSESTRING, GET_TOKEN, SET_MENU_HIGHLIGHT, GET_DOM_VALUE, ANIMATE_FADE_IN, VALIDATE_USER_INPUT, GET_DB_REFERENCE, GET_DB_USERS_INFO, IF_EXISTS, GET_VALUE, GET_USER_ID, CHECK_IF_BLOCKED_USERS_EXISTS, SAVE_TO_DB_IN_USERS, SAVE_TO_DB_IN_TEAMS, SAVE_TO_DB_IN_TEAMS_CONFIGURATION, CLOSE_MODAL, IF_ANY_BLOCKED_USERS, USERS_REF, TEAMS_REF, USERS_GET_CHILD_REF, TEAMS_GET_CHILD_REF, GET_DB_TEAMS_INFO, GET_DB_INDIVIDUAL_TEAM_INFO, GET_DB_ALL_USERS, CONVERT_STRING_TO_ARRAY, GET_DB_USERS_INVITEDTEAMS, DISABLE_SCROLL, initApp };

    constructor(
        indexController, 
        usersController,
        teamsController,
        indexModel = new IndexModel(this._loadDependencies, this._handlerDependencies, this._encryptDependencies, this._helpers, this._views),
        individualUserModel = new IndividualUserModel(this._authDependencies, this._loadDependencies, this._handlerDependencies, this._encryptDependencies, this._helpers),
        individualTeamModel = new IndividualTeamModel(this._authDependencies, this._loadDependencies, this._handlerDependencies, this._encryptDependencies, this._helpers, this._views),
        individualUserController = new IndividualUserController(this._authDependencies, this._encryptDependencies, this._helpers, this._views, individualUserModel, individualTeamModel),
        usersModel = new UsersModel(this._authDependencies, this._loadDependencies, this._handlerDependencies, this._encryptDependencies, this._helpers, this._views),
        allUsersController = new AllUsersController(this._loadDependencies, this._handlerDependencies, this._encryptDependencies, this._helpers, this._views, individualUserController, usersModel, individualUserModel),
        individualTeamController = new IndividualTeamController(this._handlerDependencies, this._authDependencies, this._loadDependencies, this._encryptDependencies, this._helpers, this._views, individualTeamModel, individualUserModel, allUsersController, individualUserController),
        teamsModel = new TeamsModel(this._authDependencies, this._loadDependencies, this._handlerDependencies, this._encryptDependencies, this._helpers, this._views)) { 
            this.indexController = indexController;
            this.usersController = usersController;
            this.teamsController = teamsController;
            this.indexModel = indexModel;
            this.usersModel = usersModel;
            this.individualUserController = individualUserController;
            this.individualUserModel = individualUserModel;
            this.allUsersController = allUsersController;
            this.teamsModel = teamsModel;
            this.individualTeamController = individualTeamController;
            this.individualTeamModel = individualTeamModel;
    }

    init(navigate = false, teamsInfo, settings) {
        this.#outputNavigation();

        if (navigate === false) {this.indexController.setView();}
        if (navigate === 'users') {this.usersController.setView();}
        if (navigate === 'teams') {this.teamsController.setView(teamsInfo, settings);}
    }

    #outputNavigation() { 
        this._authDependencies.validateIfLoggedIn();

        this._loadDependencies.displayLoading();

        this.#generateOutput();

        this.#setMenuAlerts();
        
        this.#navigateToIndexPage();

        this.#navigateToUsersPage();

        this.#navigateToTeamsPage();

        this.#logOut();
    }

    #generateOutput() {
        this._helpers.SET_INNER_HTML_VALUE({set: headerDOMElement, to: headerView(true)});
    }

    #navigateToIndexPage() {
        const mainMenuLogoDOMElement = document.querySelector('#main-menu-logo');

         mainMenuLogoDOMElement.addEventListener('click', () => {
            this.init();
        }); 
    }

    #navigateToUsersPage() {
        const mainMenuUsersDOMElement = document.querySelector('#main-menu-users');

        mainMenuUsersDOMElement.addEventListener('click', () => {
            this.init('users');
        });
    }

    #navigateToTeamsPage() {
        const mainMenuTeamsDOMElement = document.querySelector('#main-menu-teams');

        mainMenuTeamsDOMElement.addEventListener('click', () => {
            this.init('teams');
        });
    }

    #logOut() {
        const mainMenuSignOutDOMElement = document.querySelector('#main-menu-sign-out');

        mainMenuSignOutDOMElement.addEventListener('click', () => {
            this._loadDependencies.displayLoading();
            this._authDependencies.removeToken();
        });
    }

    #setMenuAlerts() {
        const token = this._helpers.PARSESTRING(this._helpers.GET_TOKEN());
        const [userId, _, __] = token.split(',');
        
        const userIdTrim = this._helpers.TRIMSTRING(userId);

        this._helpers.SALT().then((salt) => {
            const decryptId = this._encryptDependencies.decipher(salt);
            const decryptedUserId = decryptId(userIdTrim);

            const listenForUpdates = this._authDependencies.listenForUpdates(decryptedUserId);
            listenForUpdates.on('value', () => {
                this.indexModel.checkForTeamInvites().then(res => {
                
                    const contentQuantity = res[1];

                    const totalQuantity = contentQuantity;

                    if (totalQuantity > 0) {
                        const menuAlertsDOMElement = document.querySelector('#menu-alerts');
                        this._helpers.SET_INNER_HTML_VALUE({set: menuAlertsDOMElement, to: this._views.menuAlertsView(totalQuantity)});

                        chrome.storage.sync.set({ alerts: totalQuantity });
                    } else {
                        chrome.storage.sync.set({ alerts: "" });
                    }
                });
            });
        })
    }

}