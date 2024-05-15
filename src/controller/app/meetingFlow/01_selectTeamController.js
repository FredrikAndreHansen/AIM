export class SelectTeamController {

    constructor(encryptDependencies, helpers, views, teamsModel, individualTeamModel) {
        this.encryptDependencies = encryptDependencies;
        this.helpers = helpers;
        this.views = views;
        this.teamsModel = teamsModel;
        this.individualTeamModel = individualTeamModel;
    }

    setView(meetingData) {
        this.teamsModel.getTeams(false, true).then((teamsInfo) => {
            const teams = teamsInfo[0];
            const totalTeams = teamsInfo[1];

            this.teamsModel.getSortTeamsObjectData().then((sortTeamsObjectData) => {
                this.helpers.SET_INNER_HTML_VALUE({set: this.views.viewDOMElement, to: this.views.meetingViewTeam(sortTeamsObjectData, totalTeams)});

                this.#outputAllTeams(teams, meetingData);

                this.#selectTeam(meetingData);

                this.#goBack(meetingData);
            });
        });  
    }

    #goBack(meetingData) {
        const backArrowIconDOMElement = document.querySelector('.backarrow-icon');

        backArrowIconDOMElement.addEventListener('click', () => {
            this.helpers.initApp('meeting', meetingData);
        });
    }

    #outputAllTeams(teams, meetingData) {
        const teamsListDOMElement = document.querySelector('#teams-list');
        this.helpers.SET_INNER_HTML_VALUE({set: teamsListDOMElement, to: teams});

        const allTeamsDOMElement = document.querySelectorAll("#all-teams");
        this.helpers.ANIMATE_FADE_IN(allTeamsDOMElement);

        this.#toggleTeamSort(meetingData);
    }

    #toggleTeamSort(meetingData) {
        const sortTeamsDOMElement = document.querySelector('#sort-teams');

        sortTeamsDOMElement.addEventListener('click', () => {
            this.teamsModel.toggleTeamsSort().then(() => {
                this.helpers.initApp('meetingTeam', meetingData, 1);
            });
        });
    }

    #selectTeam(meetingData) {
        const allTeamsDOMElement = document.querySelectorAll("#all-teams");

        allTeamsDOMElement.forEach((getIndividualTeam) => {
            getIndividualTeam.addEventListener('click', () => {
                
                const teamId = getIndividualTeam.getAttribute('data-id');
                
                this.helpers.SALT().then((salt) => {
                    const decrypt = this.encryptDependencies.decipher(salt);
                    const decryptedId = decrypt(teamId);

                    this.individualTeamModel.getIndividualTeam(decryptedId).then(res => {
                        const { team } = res;
                        const teamName = team.teamName;
                        const members = team.members;
                        
                        if (!meetingData) {
                            meetingData = {
                                meetingType: 'meetingTeam',
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
                        this.helpers.initApp('meetingTeam', meetingData, 2);
                    });
                });
            });
        });
    }

}