export function individualUserView(userName, company) {
    return `
        <div class="error-box-container"></div>
        <div class="popup-box">
            <img class="exit-icon" src="../../graphic/exitIcon.svg" />
            <h1 class="header-small">${userName}</h1>
            <hr class="hr-small" />
            <p class="paragraph-center">${company}</p>
            <div class="space-x-big"></div>
            <button id="user-add-to-team-button" class="btn">ADD TO TEAM</button>
            <button id="user-block-button" class="btn-red">BLOCK USER</button>
        </div>
    `;
}