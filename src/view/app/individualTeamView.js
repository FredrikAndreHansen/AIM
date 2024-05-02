export function individualTeamView(teamName, memberQuantity, invitedUsersQuantity = 0, isAdmin, config) {
    return `
        <div class="content-section">
            <h1 class="header">${teamName}</h1>
            <img title="Go back" class="backarrow-icon" src="../../../graphic/backArrowIcon.svg" />
            <img title="Settings" class="cogwheel-icon" src="../../../graphic/cogwheelIcon.svg" />
            ${isAdmin === true || config.allAllowedToAddUsers === true ? '<button id="invite-members-button" class="btn-grey"><img class="inside-btn-icon-image" src="../../../graphic/userInviteIcon.svg" />INVITE USERS</button>' : ''}
            <div class="space-medium"></div>
            <hr class="hr-small">
            ${invitedUsersQuantity > 0 ? '<div class="space-x-big"></div><h1 class="header-small">Pending Invites (' + invitedUsersQuantity + ')</h1>' : ''}
            <table id="invited-user-list"></table>
            <div class="space-x-big"></div>
            <h1 class="header-small">Members (${memberQuantity})</h1>
            <table id="user-list"></table>
        </div>
    `;
}

export function adminSettingsView(teamName, config) {
    return `
        <div class="content-section">
            <h1 class="header">Settings</h1>
            <hr class="hr-small">
            <input title="Change team name" type="text" id="team-name" value="${teamName}" class="input-cut-right" maxlength="24" required />
            <div class="btn-cut-left-green-bottom" id="change-team-name">
                <img class="icon-btn-cut" src="../../graphic/pencilIcon.svg" />
            </div>
            <div class="settings-members-wrapper">
                <h2 class="header-x-small">Allow All Members To:</h2>
                <p class="header-x-small-left">Invite New Users</p>
                ${config.allAllowedToAddUsers === true ? '<div id="allowAddUsers" class="settings-circle-green"></div>' : '<div id="allowAddUsers" class="settings-circle-grey"></div>'}<div class="clear"></div>
                <p class="header-x-small-left">Kick Members</p>
                ${config.allAllowedToRemoveUsers === true ? '<div id="allowKickUsers" class="settings-circle-green"></div>' : '<div id="allowKickUsers" class="settings-circle-grey"></div>'}<div class="clear"></div>
                <p class="header-x-small-left">Remove Invited Users</p>
                ${config.allAllowedToRemovePendingInvites === true ? '<div id="allowRemoveInvitedUsers" class="settings-circle-green"></div>' : '<div id="allowRemoveInvitedUsers" class="settings-circle-grey"></div>'}<div class="clear"></div>
                <p class="header-x-small-left">Schedule Meetings</p>
                ${config.allAllowedToScheduleMeeting === true ? '<div id="allowScheduleMeeting" class="settings-circle-green"></div>' : '<div id="allowScheduleMeeting" class="settings-circle-grey"></div>'}<div class="clear"></div>
            </div>
            <br />
            <button id="delete-team-button" class="btn-red"><img class="inside-btn-icon-image-right" src="../../../graphic/exitIconWhite.svg" />DELETE TEAM</button>
            <img title="Go back" class="backarrow-icon" src="../../../graphic/backArrowIcon.svg" />
        </div>
    `;
}

export function userSettingsView(teamName, adminUser) {
    return `
        <div class="content-section">
            <h1 class="header">Settings</h1>
            <h2 class="header-small">${teamName}</h2>
            <hr class="hr-small">
            <div class="space-x-big"></div>
            <div class="settings-members-wrapper">
                <p class="paragraph-center">Only the administrator can make changes to the team</p>
                <p class="paragraph-center">Please contact <span style="font-weight: bold;">${adminUser}</span> for more information!</p>
            </div>
            <div class="space-medium"></div>
            <button id="leave-team-button" class="btn-red"><img class="inside-btn-icon-image-right" src="../../../graphic/exitIconWhite.svg" />LEAVE TEAM</button>
            <img title="Go back" class="backarrow-icon" src="../../../graphic/backArrowIcon.svg" />
        </div>
    `;
}