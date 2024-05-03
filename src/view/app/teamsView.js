export function teamsView(sortTeamsObjectData, totalTeams) { 
    return `
        <div class="content-section">
            <h1 class="header">Manage Teams</h1>
            <input type="text" id="new-team" placeholder="Create Team" class="input-cut-right" maxlength="24" required />
            <div class="btn-cut-left-green">
                <img class="icon-btn-cut" src="../../graphic/plusIcon.svg" />
            </div>
            <div class="space-medium"></div>
            <hr class="hr-small">
            ${totalTeams > 1 ? '' : '<div style="display: none;"'}
            <img title="Sort teams" id="sort-teams" class="${sortTeamsObjectData === false ? "arrow-down-icon" : "arrow-down-icon-flipped"}" src="../../../graphic/arrowDownIcon.svg" />
            ${totalTeams > 1 ? '' : '</div>'}
            <div class="space-x-big"></div>
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

export const noTeams = `
    <div class="index-section-fadein">
        <p class="paragraph-center">You have no teams!</p>
        <p class="paragraph-center-small">You can either create a new team or be invited to one</p>
        <img class="sad-icon" src="../../graphic/sadIcon.svg" />
    </div>
`;

export function inviteUserToTeamView() { 
    return `
        <div class="content-section">
            <h1 class="header">Invite</h1>
            <div class="space-medium"></div>
            <hr class="hr-small">

            <div class="space-x-big"></div>
            <table id="teams-list"></table>
        </div>
    `;
}