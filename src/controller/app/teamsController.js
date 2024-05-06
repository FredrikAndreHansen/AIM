import { AppController } from '../appController.js';

export class TeamsController extends AppController {

    constructor(teamsModel, individualTeamController, individualTeamModel) {
        super(teamsModel, individualTeamController, individualTeamModel);
    }

    setView(displayUsers = false, settings = false, inviteUsersToTeam = false) {
        this.#indexMenuHighlight();

        this.#generateOutput(displayUsers, settings, inviteUsersToTeam);
    }

    #generateOutput(displayUsers, settings, inviteUsersToTeam) {
        this.teamsModel.getTeams(inviteUsersToTeam).then((teamsInfo) => {
            const teams = teamsInfo[0];
            const totalTeams = teamsInfo[1];

            this.teamsModel.getSortTeamsObjectData().then((sortTeamsObjectData) => {
                if (inviteUsersToTeam === false) {
                    this._helpers.SET_INNER_HTML_VALUE({set: this._views.viewDOMElement, to: this._views.teamsView(sortTeamsObjectData, totalTeams)});

                    this.#outputAllTeams(teams, displayUsers, settings);
        
                    this.#createNewTeam(displayUsers);
                } else {
                    this._helpers.SET_INNER_HTML_VALUE({set: this._views.viewDOMElement, to: this._views.inviteUserToTeamView(inviteUsersToTeam, sortTeamsObjectData, totalTeams)});
                        
                    this.#outputAllTeams(teams, displayUsers, settings, inviteUsersToTeam);

                    this.#backToUsersPage();
                }
            });
        });
    }

    #outputAllTeams(teams, displayUsers, settings, userInvite = false) {
        const teamsListDOMElement = document.querySelector('#teams-list');
        this._helpers.SET_INNER_HTML_VALUE({set: teamsListDOMElement, to: teams});

        const allTeamsDOMElement = document.querySelectorAll("#all-teams");
        this._helpers.ANIMATE_FADE_IN(allTeamsDOMElement);

        this.#toggleTeamSort(userInvite, displayUsers);

        if (userInvite === false) {
            this.#getIndividualTeam(displayUsers, settings);
        }
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
                    this.#generateOutput(displayUsers, false, false);
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

    #toggleTeamSort(userInvite, displayUsers) {
        const sortTeamsDOMElement = document.querySelector('#sort-teams');

        sortTeamsDOMElement.addEventListener('click', () => {
            this.teamsModel.toggleTeamsSort().then(() => {
                if (userInvite === false) {
                    this._helpers.initApp('teams');
                } else {
                    const { userId: userId, userName: userName } = userInvite
                    this._helpers.initApp('teams', displayUsers, false, { userId: userId, userName: userName });
                }
            });
        });
    }

    #backToUsersPage() {
        const backArrowIconDOMElement = document.querySelector('.backarrow-icon');

        backArrowIconDOMElement.addEventListener('click', () => {
            this._helpers.initApp('users');
        });
    }

}