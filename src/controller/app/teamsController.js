import { viewDOMElement } from '../../index.js';
import { teamsView } from "../../view/app/teamsView.js";
import { NavigateController } from '../handlers/navigateController.js';
import { LoadController } from '../handlers/loadController.js';
import { TeamsModel } from '../../model/app/teamsModel.js';
import { SET_INNER_HTML_VALUE, SET_MENU_HIGHLIGHT, ANIMATE_FADE_IN, GET_DOM_VALUE, VALIDATE_USER_INPUT } from '../../helpers/helpers.js';

const teamsModel = new TeamsModel();

export class TeamsController {

    setView() {
        const loadController = new LoadController();
        loadController.displayLoading();

        const navigateController = new NavigateController();
        navigateController.setView();

        this.#indexMenuHighlight();

        this.generateOutput();
    }

    generateOutput() {
        teamsModel.getTeams().then((teams) => {
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
                teamsModel.addTeam(teamName);
            }
        })
    }

}