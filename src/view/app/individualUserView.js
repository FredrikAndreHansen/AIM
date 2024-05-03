export function individualUserView(userInfo) {
    const {userName, company, isBlocked, displayInTeam, kickUserFromTeam} = userInfo;

    let build = `
        <div class="error-box-container"></div>
        <div class="popup-box ">
            <div class="exit-icon">
                <img class="exit-icon-image" src="../../graphic/exitIcon.svg" />
            </div>
            <h1 class="header-small">${userName}</h1>
            <hr class="hr-small" />
            <p class="paragraph-center">${company}</p>
            <div class="space-x-big"></div>
    `;
    if(kickUserFromTeam === false){
        if (isBlocked === false) {
            build += `
                <button id="user-invite-to-team-button" class="btn-grey"><img class="inside-btn-icon-image" src="../../../graphic/userInviteIcon.svg" /> ${displayInTeam === false ? 'INVITE TO TEAM' : 'INVITE'}</button>
                ${displayInTeam === false ? '<button id="user-block-button" class="btn-grey"><img class="inside-btn-icon-image" src="../../../graphic/userBlockIcon.svg" /> BLOCK</button>' : ''}
                </div>
            `;
            
        } else {
            build += `
                <button id="user-unblock-button" class="btn-green"><img class="inside-btn-icon-image" src="../../../graphic/teamsIcon.svg" /> UNBLOCK</button>
                </div>
            `;
        }
    } else {
        build += `
            <button id="user-kick-button" class="btn-grey"><img class="inside-btn-icon-image" src="../../../graphic/userBlockIcon.svg" /> REMOVE</button>
            </div>
        `;
    }

    return build;
}