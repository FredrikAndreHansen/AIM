import { viewDOMElement } from '../../index.js';
import { teamsView } from "../../view/app/teamsView.js";
import { AppController } from '../appController.js';
import { initApp } from '../../config/init.js';
import { SET_INNER_HTML_VALUE, SET_MENU_HIGHLIGHT, ANIMATE_FADE_IN, GET_DOM_VALUE, VALIDATE_USER_INPUT } from '../../helpers/helpers.js';

export class TeamsController extends AppController {

    constructor(teamsModel) {
        super(teamsModel);
    }

    setView() {
        this.#indexMenuHighlight();

        this.#generateOutput();
    }

    #generateOutput() {
        this.teamsModel.getTeams().then((teams) => {
            SET_INNER_HTML_VALUE({set: viewDOMElement, to: teamsView});

            this.#outputAllTeams(teams);

            this.#createNewTeam();
        });
    }

    #outputAllTeams(teams) {
        const teamsListDOMElement = document.querySelector('#teams-list');
        SET_INNER_HTML_VALUE({set: teamsListDOMElement, to: teams});

        const allTeamsDOMElement = document.querySelectorAll("#all-teams");
        ANIMATE_FADE_IN(allTeamsDOMElement);
    }

    #indexMenuHighlight() {
        const mainMenuTeamsDOMElement = document.querySelector('#main-menu-teams');
        SET_MENU_HIGHLIGHT(mainMenuTeamsDOMElement);
    }

    #createNewTeam() {
        const createTeamButtonDOMElement = document.querySelector('#create-team-button');
        createTeamButtonDOMElement.addEventListener('click', (e) => {
            e.preventDefault();

            const newTeamDOMElement = document.querySelector('#new-team');
            const teamName = GET_DOM_VALUE(newTeamDOMElement);

            if (VALIDATE_USER_INPUT({name: teamName})) {
                this.teamsModel.addTeam(teamName);

                this.#delayRefresh();
            }
        })
    }

    #delayRefresh() {
        setTimeout(() => {
            this.#generateOutput();
        }, 100);
    }

}