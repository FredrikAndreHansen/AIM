import { AppController } from '../appController.js';

export class TeamsController extends AppController {

    constructor(teamsModel, individualTeamController, individualTeamModel) {
        super(teamsModel, individualTeamController, individualTeamModel);
    }

    setView(displayUsers = false) {
        this.#indexMenuHighlight();

        this.#generateOutput(displayUsers);
    }

    #generateOutput(displayUsers) {
        this.teamsModel.getTeams().then((teams) => {
            this._helpers.SET_INNER_HTML_VALUE({set: this._views.viewDOMElement, to: this._views.teamsView});

            this.#outputAllTeams(teams, displayUsers);

            this.#createNewTeam(displayUsers);
        });
    }

    #outputAllTeams(teams, displayUsers) {
        const teamsListDOMElement = document.querySelector('#teams-list');
        this._helpers.SET_INNER_HTML_VALUE({set: teamsListDOMElement, to: teams});

        const allTeamsDOMElement = document.querySelectorAll("#all-teams");
        this._helpers.ANIMATE_FADE_IN(allTeamsDOMElement);

        this.#getIndividualTeam(displayUsers);
    }

    #indexMenuHighlight() {
        const mainMenuTeamsDOMElement = document.querySelector('#main-menu-teams');
        this._helpers.SET_MENU_HIGHLIGHT(mainMenuTeamsDOMElement);
    }

    #createNewTeam(displayUsers) {
        const createTeamButtonDOMElement = document.querySelector('.btn-cut-left-green');
        createTeamButtonDOMElement.addEventListener('click', () => {
            const newTeamDOMElement = document.querySelector('#new-team');
            const teamName = this._helpers.GET_DOM_VALUE(newTeamDOMElement);

            if (this._helpers.VALIDATE_USER_INPUT({name: teamName})) {
                this.teamsModel.addTeam(teamName);

                this.#delayRefresh(displayUsers);
            }
        })
    }

    #delayRefresh(displayUsers) {
        setTimeout(() => {
            this.#generateOutput(displayUsers);
        }, 200);
    }

    #getIndividualTeam(displayUsers) {
        if (displayUsers !== false) {
            const { teamName, members, invitedUsers, isAdmin, config, teamId } = displayUsers;

            this.individualTeamController.setView(teamName, members, invitedUsers, isAdmin, config, teamId);
        }

        const allTeamsDOMElement = document.querySelectorAll("#all-teams");

        allTeamsDOMElement.forEach((getIndividualTeam) => {

            getIndividualTeam.addEventListener('click', () => {

                this._loadDependencies.displayLoading();
                const teamId = getIndividualTeam.getAttribute('data-id');

                this._helpers.SALT().then((salt) => {
                    const decrypt = this._encryptDependencies.decipher(salt);
                    const decryptedId = decrypt(teamId);

                    this.individualTeamModel.getIndividualTeam(decryptedId).then(res => {
                        const { team, isAdmin } = res;
                        const teamName = team.teamName;
                        const members = team.members;
                        const config = team.configuration;
                        const invitedUsers = Object.values(team.invitedUsers);

                        this.individualTeamController.setView(teamName, members, invitedUsers, isAdmin, config, decryptedId);
                    });
                });
            });
        });
    }

}