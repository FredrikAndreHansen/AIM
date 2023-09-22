export function individualUserView(userInfo) {
    const {userName, company, isBlocked} = userInfo;
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
    if (isBlocked === false) {
        build += `
            <button id="user-add-to-team-button" class="btn-grey"><img class="inside-btn-icon-image" src="../../../graphic/userInviteIcon.svg" /> INVITE TO TEAM</button>
            <button id="user-block-button" class="btn-grey"><img class="inside-btn-icon-image" src="../../../graphic/userBlockIcon.svg" /> BLOCK USER</button>
            </div>
        `;
    } else {
        build += `
            <button id="user-unblock-button" class="btn-green"><img class="inside-btn-icon-image" src="../../../graphic/teamsIcon.svg" /> UNBLOCK USER</button>
            </div>
        `;
    }

    return build;
}