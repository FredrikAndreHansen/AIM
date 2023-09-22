import { AppController } from '../appController.js';

export class TeamsController extends AppController {

    constructor(teamsModel, individualTeamController, individualTeamModel) {
        super(teamsModel, individualTeamController, individualTeamModel);
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

        this.#getIndividualTeam();
    }

    #indexMenuHighlight() {
        const mainMenuTeamsDOMElement = document.querySelector('#main-menu-teams');
        this._helpers.SET_MENU_HIGHLIGHT(mainMenuTeamsDOMElement);
    }

    #createNewTeam() {
        const createTeamButtonDOMElement = document.querySelector('.btn-cut-left-green');
        createTeamButtonDOMElement.addEventListener('click', () => {
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

    #getIndividualTeam() {
        const allTeamsDOMElement = document.querySelectorAll("#all-teams");

        allTeamsDOMElement.forEach((getIndividualTeam) => {

            getIndividualTeam.addEventListener('click', () => {

                this._loadDependencies.displayLoading();
                const teamId = getIndividualTeam.getAttribute('data-id');

                this._helpers.SALT().then((salt) => {
                    const decrypt = this._encryptDependencies.decipher(salt);
                    const decryptedId = decrypt(teamId);

                    this.individualTeamModel.getIndividualTeam(decryptedId).then(res => {
                        const teamName = res[1];
                        const members = res[2];

                        this.individualTeamController.setView(teamName, members);
                    });
                });
            });
        });
    }

}