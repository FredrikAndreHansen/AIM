import { AppController } from '../appController.js';

export class MeetingController extends AppController {

    constructor(teamsModel) {
        super(teamsModel);
    }

    setView(meetingData, page) {
        this.#meetingMenuHighlight();

        if (page === false) {
            this.#generateOutput(meetingData);
        } else {
            this.#navigateMeetingWorkflow(meetingData, page)
        }
    }

    #generateOutput(meetingData) {
        this.teamsModel.getTeams(false, true).then((teamsInfo) => {
            const teams = teamsInfo[0];
            const totalTeams = teamsInfo[1];

            this.teamsModel.getSortTeamsObjectData().then((sortTeamsObjectData) => {
                this._helpers.SET_INNER_HTML_VALUE({set: this._views.viewDOMElement, to: this._views.meetingView(sortTeamsObjectData, totalTeams)});

                const indexSectionFadeInDOMElement = document.querySelector('.index-section-fadein');
                this._helpers.SET_INNER_HTML_VALUE({set: indexSectionFadeInDOMElement, to: this._views.calendarView()});

                this.#outputAllTeams(teams, meetingData);

                this.#selectTeam(meetingData);
            });
        });  
    }

    #outputAllTeams(teams, meetingData) {
        const teamsListDOMElement = document.querySelector('#teams-list');
        this._helpers.SET_INNER_HTML_VALUE({set: teamsListDOMElement, to: teams});

        const allTeamsDOMElement = document.querySelectorAll("#all-teams");
        this._helpers.ANIMATE_FADE_IN(allTeamsDOMElement);

        this.#toggleTeamSort(meetingData);
    }

    #toggleTeamSort(meetingData) {
        const sortTeamsDOMElement = document.querySelector('#sort-teams');

        sortTeamsDOMElement.addEventListener('click', () => {
            this.teamsModel.toggleTeamsSort().then(() => {
                this._helpers.initApp('meeting', meetingData);
            });
        });
    }

    #selectTeam(meetingData) {
        const allTeamsDOMElement = document.querySelectorAll("#all-teams");

        allTeamsDOMElement.forEach((getIndividualTeam) => {
            getIndividualTeam.addEventListener('click', () => {
                
                const teamId = getIndividualTeam.getAttribute('data-id');
                
                this._helpers.SALT().then((salt) => {
                    const decrypt = this._encryptDependencies.decipher(salt);
                    const decryptedId = decrypt(teamId);

                    this.individualTeamModel.getIndividualTeam(decryptedId).then(res => {
                        const { team } = res;
                        const teamName = team.teamName;
                        const members = team.members;
                        
                        if (!meetingData) {
                            meetingData = {
                                teamId: decryptedId,
                                teamName: teamName,
                                members: members,
                                dates: []
                            };
                        } else {
                            meetingData.teamId = decryptedId;
                            meetingData.teamName = teamName;
                            meetingData.members = members;
                        }
                        this.#navigateMeetingWorkflow(meetingData, 1);
                    });
                });
            });
        });
    }

    #navigateMeetingWorkflow(meetingData, page) {
        if (page === 1) {
            this.selectDateController.setView(meetingData);
        }

        if (page === 2) {
            this.selectTimeController.setView(meetingData);
        }
    }

    #meetingMenuHighlight() {
        const mainMenuMeetingDOMElement = document.querySelector('#main-menu-meeting');
        this._helpers.SET_MENU_HIGHLIGHT(mainMenuMeetingDOMElement);
    }

}