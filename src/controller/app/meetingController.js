import { AppController } from '../appController.js';

export class MeetingController extends AppController {

    constructor(teamsModel) {
        super(teamsModel);
    }

    setView() {
        this.#meetingMenuHighlight();

        this.#generateOutput();
    }

    #generateOutput() {
        this.teamsModel.getTeams().then((teamsInfo) => {
            const teams = teamsInfo[0];
            const totalTeams = teamsInfo[1];

            this.teamsModel.getSortTeamsObjectData().then((sortTeamsObjectData) => {
                this._helpers.SET_INNER_HTML_VALUE({set: this._views.viewDOMElement, to: this._views.meetingView(sortTeamsObjectData, totalTeams)});

                const indexSectionFadeInDOMElement = document.querySelector('.index-section-fadein');
                this._helpers.SET_INNER_HTML_VALUE({set: indexSectionFadeInDOMElement, to: this._views.calendarView()});

                this.#outputAllTeams(teams);
            });
        });  
    }

    #outputAllTeams(teams) {
        const teamsListDOMElement = document.querySelector('#teams-list');
        this._helpers.SET_INNER_HTML_VALUE({set: teamsListDOMElement, to: teams});

        const allTeamsDOMElement = document.querySelectorAll("#all-teams");
        this._helpers.ANIMATE_FADE_IN(allTeamsDOMElement);

        this.#toggleTeamSort();
    }

    #toggleTeamSort() {
        const sortTeamsDOMElement = document.querySelector('#sort-teams');

        sortTeamsDOMElement.addEventListener('click', () => {
            this.teamsModel.toggleTeamsSort().then(() => {
                this._helpers.initApp('meeting');
            });
        });
    }

    #meetingMenuHighlight() {
        const mainMenuMeetingDOMElement = document.querySelector('#main-menu-meeting');
        this._helpers.SET_MENU_HIGHLIGHT(mainMenuMeetingDOMElement);
    }

}