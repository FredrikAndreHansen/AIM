import { AppController } from '../appController.js';

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
            this._helpers.SET_INNER_HTML_VALUE({set: this._views.viewDOMElement, to: this._views.teamsView});

            this.#outputAllTeams(teams);

            this.#createNewTeam();
        });
    }

    #outputAllTeams(teams) {
        const teamsListDOMElement = document.querySelector('#teams-list');
        this._helpers.SET_INNER_HTML_VALUE({set: teamsListDOMElement, to: teams});

        const allTeamsDOMElement = document.querySelectorAll("#all-teams");
        this._helpers.ANIMATE_FADE_IN(allTeamsDOMElement);
    }

    #indexMenuHighlight() {
        const mainMenuTeamsDOMElement = document.querySelector('#main-menu-teams');
        this._helpers.SET_MENU_HIGHLIGHT(mainMenuTeamsDOMElement);
    }

    #createNewTeam() {
        const createTeamButtonDOMElement = document.querySelector('#create-team-button');
        createTeamButtonDOMElement.addEventListener('click', (e) => {
            e.preventDefault();

            const newTeamDOMElement = document.querySelector('#new-team');
            const teamName = this._helpers.GET_DOM_VALUE(newTeamDOMElement);

            if (this._helpers.VALIDATE_USER_INPUT({name: teamName})) {
                this.teamsModel.addTeam(teamName);

                this.#delayRefresh();
            }
        })
    }

    #delayRefresh() {
        setTimeout(() => {
            this.#generateOutput();
        }, 200);
    }

}