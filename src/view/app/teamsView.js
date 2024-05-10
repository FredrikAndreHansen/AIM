export function teamsView(sortTeamsObjectData, totalTeams) { 
    return `
        <div class="content-section">
            <h1 class="header">Manage Teams</h1>
            <input type="text" id="new-team" placeholder="Create Team" class="input-cut-right" maxlength="24" required />
            <div class="btn-cut-left-green">
                <img class="icon-btn-cut" src="../../graphic/plusIcon.svg" />
            </div>
            <div class="space-medium"></div>
            ${sortTeams(sortTeamsObjectData, totalTeams)}
            <table id="teams-list"></table>
        </div>
    `;
}

export function teamsOutputView(teamInfo) {
    const { encryptedKey, team, usersInTeam } = teamInfo;
    
    return `                        
        <tr class="tr tr-not-self" id="all-teams" data-id="${encryptedKey}">
            <td class="team-td"><img class="user-icon" src="../../graphic/teamsIcon.svg" /></td>
            <td>
                <p class="paragraph-center">${team}</p>
                <hr class="hr-x-small" style="margin-top: -8px;" />
                <p class="paragraph-center-small" style="margin-top: -6px;">${usersInTeam} ${usersInTeam === 1 ? ' Member' : ' Members'}</p>
            </td>
        </tr>
    `;
}

export function noTeams(inviteUser, addToMeeting) { 
    return `
        <div class="wrapper">
            <div class="index-section-fadein">
                <p class="paragraph-center">${addToMeeting === false ? 'You have no teams!' : 'You need a team to schedule a meeting!'}</p>
                <p class="paragraph-center-small-nobreak">
                    ${addToMeeting === false ? inviteUser === false ? 'You can either create a new team or be invited to one' : "Either your teams doesn't allow you to invite users or the user is already a part of your teams" : "If you already have a team it could be that you don't have permission to schedule a meeting, then check with your team administrator for more information"}
                </p>
                <img class="sad-icon" src="../../graphic/sadIcon.svg" />
            </div>
        </div>
    `;
}

export function inviteUserToTeamView(inviteUsersToTeam, sortTeamsObjectData, totalTeams) { 
    const { userName } = inviteUsersToTeam
    return `
        <div class="content-section">
            <p class="header-small">Invite <span style="font-weight: bold;">${userName}</span> to a team</p>
            <div class="space-medium"></div>
            ${sortTeams(sortTeamsObjectData, totalTeams)}
            <table id="teams-list"></table>
            <img title="Go back" class="backarrow-icon" src="../../../graphic/backArrowIcon.svg" />
        </div>
    `;
}

export function sortTeams(sortTeamsObjectData, totalTeams) {
    return `
        <hr class="hr-small">
        ${totalTeams > 1 ? '' : '<div style="display: none;"'}
        <img title="Sort teams" id="sort-teams" class="${sortTeamsObjectData === false ? "arrow-down-icon" : "arrow-down-icon-flipped"}" src="../../../graphic/arrowDownIcon.svg" />
        ${totalTeams > 1 ? '' : '</div>'}
        <div class="space-x-big"></div>
    `;
}