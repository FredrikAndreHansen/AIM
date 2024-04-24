import { AppController } from '../appController.js';

export class TeamsController extends AppController {

    constructor(teamsModel, individualTeamController, individualTeamModel) {
        super(teamsModel, individualTeamController, individualTeamModel);
    }

    setView(displayUsers = false, settings = false) {
        this.#indexMenuHighlight();

        this.#generateOutput(displayUsers, settings);
    }

    #generateOutput(displayUsers, settings) {
        this.teamsModel.getTeams().then((teams) => {
            this.teamsModel.getSortTeamsObjectData().then((sortTeamsObjectData) => {
                this.teamsModel.countTeamsTotal().then((totalTeams) => {
                    this._helpers.SET_INNER_HTML_VALUE({set: this._views.viewDOMElement, to: this._views.teamsView(sortTeamsObjectData, totalTeams)});

                    this.#outputAllTeams(teams, displayUsers, settings);
    
                    this.#createNewTeam(displayUsers);
                });
            });
        });
    }

    #outputAllTeams(teams, displayUsers, settings) {
        const teamsListDOMElement = document.querySelector('#teams-list');
        this._helpers.SET_INNER_HTML_VALUE({set: teamsListDOMElement, to: teams});

        const allTeamsDOMElement = document.querySelectorAll("#all-teams");
        this._helpers.ANIMATE_FADE_IN(allTeamsDOMElement);

        this.#toggleTeamSort();

        this.#getIndividualTeam(displayUsers, settings);
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
                this.teamsModel.addTeam(teamName).then(() => {
                    this.#generateOutput(displayUsers);
                });
            }
        })
    }

    #getIndividualTeam(displayUsers, settings) {
        const allTeamsDOMElement = document.querySelectorAll("#all-teams");
    
        if (settings === 'settings' || displayUsers !== false) {
            const { teamName, members, invitedUsers, isAdmin, config, teamId } = displayUsers;
        
            this.individualTeamController.setView(teamName, members, invitedUsers, isAdmin, config, teamId, settings);
        }

        allTeamsDOMElement.forEach((getIndividualTeam) => {

            getIndividualTeam.addEventListener('click', () => {
                if (displayUsers !== false) {
                    const { teamName, members, invitedUsers, isAdmin, config, teamId } = displayUsers;
        
                    this.individualTeamController.setView(teamName, members, invitedUsers, isAdmin, config, teamId, settings);
                }

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

    #toggleTeamSort() {
        const sortTeamsDOMElement = document.querySelector('#sort-teams');

        sortTeamsDOMElement.addEventListener('click', () => {
            this.teamsModel.toggleTeamsSort().then(() => {
                this._helpers.initApp('teams');
            });
        });
    }

}