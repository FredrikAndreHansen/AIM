export class IndividualTeamController {

    constructor(authDependencies, helpers, views, individualTeamModel, allUsersController) {
        this.authDependencies = authDependencies;
        this.helpers = helpers;
        this.views = views;
        this.individualTeamModel = individualTeamModel;
        this.allUsersController = allUsersController;
    }

    setView(teamName, members, invitedUsers, isAdmin, config, teamId) {
        this.authDependencies.validateIfLoggedIn();

        this.#generateOutput(teamName, members, invitedUsers, isAdmin, config, teamId);
    }

    #generateOutput(teamName, members, invitedUsers, isAdmin, config, teamId) {
        this.individualTeamModel.generateTeamUsers(members, invitedUsers, config, teamId).then((res) => {
            const memberQuantity = members.length;
            const membersOutput = res[0];

            const invitedUsersQuantity = invitedUsers.length - 1;
            const invitedUsersOutput = res[1];

            this.helpers.SET_INNER_HTML_VALUE({set: this.views.viewDOMElement, to: this.views.individualTeamView(teamName, memberQuantity, invitedUsersQuantity, isAdmin, config)});

            const userListDOMElement = document.querySelector('#user-list');
            this.helpers.SET_INNER_HTML_VALUE({set: userListDOMElement, to: membersOutput});

            const invitedUserListDOMElement = document.querySelector('#invited-user-list');
            this.helpers.SET_INNER_HTML_VALUE({set: invitedUserListDOMElement, to: invitedUsersOutput});

            const allUsersDOMElement = document.querySelectorAll("#all-users");
            this.helpers.ANIMATE_FADE_IN(allUsersDOMElement);

            this.#goBackToTeamsPage();

            this.#inviteUsers(teamName, members, invitedUsers, isAdmin, config, teamId);
        });
    }

    #goBackToTeamsPage() {
         const backArrowIconDOMElement = document.querySelector('.backarrow-icon');

         backArrowIconDOMElement.addEventListener('click', () => {
            this.helpers.initApp('teams');
         });
    }

    #inviteUsers(teamName, members, invitedUsers, isAdmin, config, teamId) {
        if (isAdmin === true || config.allAllowedToAddUsers === true) {
            const inviteMembersBtnDOMElement = document.querySelector('#invite-members-button');

            inviteMembersBtnDOMElement.addEventListener('click', () => {
                this.#generateInviteUsersOutput(teamName, members, invitedUsers, isAdmin, config, teamId);
            });
        }
    }

    #generateInviteUsersOutput(teamName, members, invitedUsers, isAdmin, config, teamId) {
        const teamInfo = {
            teamName: teamName,
            members: members,
            invitedUsers: invitedUsers,
            isAdmin: isAdmin,
            config: config,
            teamId: teamId
        };
        this.allUsersController.setView(true, teamInfo);
    }

}