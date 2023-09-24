export class IndividualTeamController {

    constructor(authDependencies, helpers, views, individualTeamModel) {
        this.authDependencies = authDependencies;
        this.helpers = helpers;
        this.views = views;
        this.individualTeamModel = individualTeamModel;
    }

    setView(teamName, members, isAdmin, teamId) {
        this.authDependencies.validateIfLoggedIn();

        this.#generateOutput(teamName, members, isAdmin, teamId);
    }

    #generateOutput(teamName, members, isAdmin, teamId) {
        this.individualTeamModel.generateTeamUsers(members).then((res) => {
            const memberQuantity = members.length;
            const membersOutput = res[0];

            this.helpers.SET_INNER_HTML_VALUE({set: this.views.viewDOMElement, to: this.views.individualTeamView(teamName, memberQuantity, isAdmin)});

            const userListDOMElement = document.querySelector('#user-list');
            this.helpers.SET_INNER_HTML_VALUE({set: userListDOMElement, to: membersOutput});

            const allUsersDOMElement = document.querySelectorAll("#all-users");
            this.helpers.ANIMATE_FADE_IN(allUsersDOMElement);

            this.#goBackToTeamsPage();

            this.#inviteUsers(teamName, teamId);
        });
    }

    #goBackToTeamsPage() {
         const backArrowIconDOMElement = document.querySelector('.backarrow-icon');

         backArrowIconDOMElement.addEventListener('click', () => {
            this.helpers.initApp('teams');
         });
    }

    #inviteUsers(teamName, teamId) {
        const inviteMembersBtnDOMElement = document.querySelector('#invite-members-button');

        inviteMembersBtnDOMElement.addEventListener('click', () => {
            alert(teamId + " " + teamName);
        });
    }

}