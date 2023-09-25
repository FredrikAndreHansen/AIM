export class IndividualTeamController {

    constructor(authDependencies, helpers, views, individualTeamModel, allUsersController) {
        this.authDependencies = authDependencies;
        this.helpers = helpers;
        this.views = views;
        this.individualTeamModel = individualTeamModel;
        this.allUsersController = allUsersController;
    }

    setView(teamNameSet, membersSet, isAdminSet, teamIdSet, displayUsers) {
        this.authDependencies.validateIfLoggedIn();

        if (displayUsers !== false) {
            //const {teamName, members, isAdmin, teamId} = displayUsers;
            //this.#generateOutput(teamName, members, isAdmin, teamId);
            alert(displayUsers)
        } else {
        this.#generateOutput(teamNameSet, membersSet, isAdminSet, teamIdSet);
        }
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

            this.#inviteUsers(teamName, members, isAdmin, teamId);
        });
    }

    #goBackToTeamsPage() {
         const backArrowIconDOMElement = document.querySelector('.backarrow-icon');

         backArrowIconDOMElement.addEventListener('click', () => {
            this.helpers.initApp('teams');
         });
    }

    #inviteUsers(teamName, members, isAdmin, teamId) {
        const inviteMembersBtnDOMElement = document.querySelector('#invite-members-button');

        inviteMembersBtnDOMElement.addEventListener('click', () => {
            this.#generateInviteUsersOutput(teamName, members, isAdmin, teamId);
        });
    }

    #generateInviteUsersOutput(teamName, members, isAdmin, teamId) {
        const teamInfo = {
            teamName: teamName,
            members: members,
            isAdmin: isAdmin,
            teamId: teamId
        };
        this.allUsersController.setView(true, teamInfo);
    }

}