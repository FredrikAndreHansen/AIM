import { headerDOMElement, viewDOMElement, popupDOMElement } from "../index.js";
import { headerView } from "../view/handlers/headerView.js";
import { indexView, invitedUsersHeadingView, invitedUsersView, noAlertsView, menuAlertsView } from "../view/app/indexView.js";
import { usersView, userOutputView, userSearchOutput } from "../view/app/usersView.js";
import { individualUserView } from "../view/app/individualUserView.js";
import { teamsView, teamsOutputView, noTeams, inviteUserToTeamView } from "../view/app/teamsView.js";
import { individualTeamView, adminSettingsView, userSettingsView } from "../view/app/individualTeamView.js";
import { meetingView, meetingViewTeam, calendarView, selectDateView, selectTimeView } from "../view/app/meetingView.js";
import { IndividualUserController } from "./app/individualUserController.js";
import { IndividualTeamController } from "./app/individualTeamController.js";
import { AllUsersController } from "./app/allUsersController.js";
import { SelectTeamController } from "./app/meetingFlow/01_selectTeamController.js";
import { SelectDateController } from "./app/meetingFlow/02_selectDateController.js";
import { SelectTimeController } from "./app/meetingFlow/03_selectTimeController.js";
import { IndexModel } from "../model/app/indexModel.js";
import { UsersModel } from "../model/app/usersModel.js";
import { IndividualUserModel } from "../model/app/individualUserModel.js";
import { TeamsModel } from "../model/app/teamsModel.js";
import { MeetingModel } from "../model/app/meetingModel.js";
import { SelectDateModel } from "../model/app/meetingFlow/02_selectDateModel.js";
import { SelectTimeModel } from "../model/app/meetingFlow/03_selectTimeModel.js";
import { displayLoading, removeLoading } from "../libraries/load.js";
import { displayMessage, throwError, confirmMessage } from "../libraries/handler.js";
import { validateIfLoggedIn, removeToken, listenForUpdates } from "../helpers/auth.js";
import { cipher, decipher } from "../helpers/encrypt.js";
import { initApp } from "../libraries/init.js";
import { SET_INNER_HTML_VALUE, SALT, GLOBAL_CONFIG, TRIMSTRING, PARSESTRING, REMOVE_SEMICOLON, REMOVE_FULLSTOP, GET_TOKEN, SET_MENU_HIGHLIGHT, GET_DOM_VALUE, CLEAR_DOM_VALUE, ANIMATE_FADE_IN, VALIDATE_USER_INPUT, CANT_BE_THE_SAME_NAME, GET_DB_REFERENCE, GET_DB_USERS_INFO, IF_EXISTS, GET_VALUE, GET_USER_ID, CHECK_IF_BLOCKED_USERS_EXISTS, SAVE_TO_DB_IN_USERS, SAVE_TO_DB_IN_USERS_CONFIG, SAVE_TO_DB_IN_TEAMS, SAVE_TO_DB_IN_TEAMS_CONFIGURATION, CLOSE_MODAL, IF_ANY_BLOCKED_USERS, USERS_REF, TEAMS_REF, USERS_GET_CHILD_REF, TEAMS_GET_CHILD_REF, GET_DB_TEAMS_INFO, GET_DB_INDIVIDUAL_TEAM_INFO, GET_DB_ALL_USERS, CONVERT_STRING_TO_ARRAY, GET_DB_USERS_INVITEDTEAMS, DISABLE_SCROLL, PRINT_TIME_ONE_HOUR_AHEAD, GET_LANGUAGE, MICROPHONE_STOP_LISTEN, REFRESH_APPLICATION } from "../helpers/helpers.js";
import { IndividualTeamModel } from "../model/app/individualTeamModel.js";

export class AppController {

    _views = { viewDOMElement, indexView, invitedUsersHeadingView, invitedUsersView, noAlertsView, menuAlertsView, usersView, userOutputView, userSearchOutput, individualUserView, teamsView, teamsOutputView, noTeams, inviteUserToTeamView, popupDOMElement, individualTeamView, adminSettingsView, userSettingsView, meetingView, meetingViewTeam, calendarView, selectDateView, selectTimeView };
    _loadDependencies = { displayLoading, removeLoading };
    _handlerDependencies = { displayMessage, throwError, confirmMessage };
    _authDependencies = { validateIfLoggedIn, removeToken, listenForUpdates };
    _encryptDependencies = { cipher, decipher };
    _helpers = { SET_INNER_HTML_VALUE, SALT, GLOBAL_CONFIG, TRIMSTRING, PARSESTRING, REMOVE_SEMICOLON, REMOVE_FULLSTOP, GET_TOKEN, SET_MENU_HIGHLIGHT, GET_DOM_VALUE, CLEAR_DOM_VALUE, ANIMATE_FADE_IN, VALIDATE_USER_INPUT, CANT_BE_THE_SAME_NAME, GET_DB_REFERENCE, GET_DB_USERS_INFO, IF_EXISTS, GET_VALUE, GET_USER_ID, CHECK_IF_BLOCKED_USERS_EXISTS, SAVE_TO_DB_IN_USERS, SAVE_TO_DB_IN_USERS_CONFIG, SAVE_TO_DB_IN_TEAMS, SAVE_TO_DB_IN_TEAMS_CONFIGURATION, CLOSE_MODAL, IF_ANY_BLOCKED_USERS, USERS_REF, TEAMS_REF, USERS_GET_CHILD_REF, TEAMS_GET_CHILD_REF, GET_DB_TEAMS_INFO, GET_DB_INDIVIDUAL_TEAM_INFO, GET_DB_ALL_USERS, CONVERT_STRING_TO_ARRAY, GET_DB_USERS_INVITEDTEAMS, DISABLE_SCROLL, PRINT_TIME_ONE_HOUR_AHEAD, GET_LANGUAGE, MICROPHONE_STOP_LISTEN, REFRESH_APPLICATION, initApp };

    constructor(
        indexController, 
        usersController,
        teamsController,
        meetingController,
        indexModel = new IndexModel(this._loadDependencies, this._handlerDependencies, this._encryptDependencies, this._helpers, this._views),
        individualUserModel = new IndividualUserModel(this._authDependencies, this._loadDependencies, this._handlerDependencies, this._encryptDependencies, this._helpers),
        individualTeamModel = new IndividualTeamModel(this._authDependencies, this._loadDependencies, this._handlerDependencies, this._encryptDependencies, this._helpers, this._views, individualUserModel),
        meetingModel = new MeetingModel(this._handlerDependencies, this._helpers),
        selectDateModel = new SelectDateModel(this._authDependencies, this._loadDependencies, this._handlerDependencies, this._helpers, meetingModel),
        selectTimeModel = new SelectTimeModel(this._authDependencies, this._loadDependencies, this._handlerDependencies, this._helpers, meetingModel),
        individualUserController = new IndividualUserController(this._authDependencies, this._encryptDependencies, this._helpers, this._views, individualUserModel, individualTeamModel),
        usersModel = new UsersModel(this._authDependencies, this._loadDependencies, this._handlerDependencies, this._encryptDependencies, this._helpers, this._views),
        allUsersController = new AllUsersController(this._loadDependencies, this._handlerDependencies, this._encryptDependencies, this._helpers, this._views, individualUserController, usersModel, individualUserModel),
        individualTeamController = new IndividualTeamController(this._handlerDependencies, this._authDependencies, this._loadDependencies, this._encryptDependencies, this._helpers, this._views, individualTeamModel, individualUserModel, allUsersController, individualUserController),
        selectDateController = new SelectDateController(this._helpers, this._views, selectDateModel),
        selectTimeController = new SelectTimeController(this._helpers, this._views, selectTimeModel),
        teamsModel = new TeamsModel(this._authDependencies, this._loadDependencies, this._handlerDependencies, this._encryptDependencies, this._helpers, this._views),
        selectTeamController = new SelectTeamController(this._encryptDependencies, this._helpers, this._views, teamsModel, individualTeamModel)) { 
            this.indexController = indexController;
            this.usersController = usersController;
            this.teamsController = teamsController;
            this.meetingController = meetingController;
            this.indexModel = indexModel;
            this.usersModel = usersModel;
            this.meetingModel = meetingModel;
            this.selectTeamController = selectTeamController;
            this.selectDateModel = selectDateModel;
            this.selectTimeModel = selectTimeModel;
            this.individualUserController = individualUserController;
            this.individualUserModel = individualUserModel;
            this.allUsersController = allUsersController;
            this.teamsModel = teamsModel;
            this.individualTeamController = individualTeamController;
            this.selectDateController = selectDateController;
            this.selectTimeController = selectTimeController;
            this.individualTeamModel = individualTeamModel;
    }

    init(navigate = false, data = false, page = false, inviteUsersToTeam = false) {
        this.#outputNavigation();

        if (navigate === false) {this.indexController.setView();}
        if (navigate === 'users') {this.usersController.setView();}
        if (navigate === 'teams') {this.teamsController.setView(data, page, inviteUsersToTeam);}
        if (navigate === 'meeting') {this.meetingController.setView(data);}
        if (navigate === 'meetingTeam') {this.meetingController.navigateMeetingForTeam(data, page);}
    }

    #outputNavigation() { 
        this._authDependencies.validateIfLoggedIn();

        this._loadDependencies.displayLoading();

        this.#generateOutput();

        this.#setMenuAlerts();
        
        this.#navigateToIndexPage();

        this.#navigateToUsersPage();

        this.#navigateToTeamsPage();

        this.#navigateToMeetingPage();

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

    #navigateToMeetingPage() {
        const mainMenuTeamsDOMElement = document.querySelector('#main-menu-meeting');

        mainMenuTeamsDOMElement.addEventListener('click', () => {
            this.init('meeting');
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