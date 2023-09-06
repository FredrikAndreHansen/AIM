export function individualUserView(userInfo) {
    const {userName, company, isBlocked} = userInfo;
    let build = `
        <div class="error-box-container"></div>
        <div class="popup-box ${isBlocked === true ? 'red-background-override' : ''}">
            <img class="exit-icon" src="../../graphic/exitIcon.svg" />
            <h1 class="header-small">${userName}</h1>
            <hr class="hr-small" />
            <p class="paragraph-center">${company}</p>
            <div class="space-x-big"></div>
    `;
    if (isBlocked === false) {
        build += `
            <button id="user-add-to-team-button" class="btn">ADD TO TEAM</button>
            <button id="user-block-button" class="btn-red">BLOCK USER</button>
            </div>
        `;
    } else {
        build += `
            <button id="user-unblock-button" class="btn-green">UNBLOCK USER</button>
            </div>
        `;
    }

    return build;
}