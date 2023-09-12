export function indexView(userInfo) { 
    const { userName, company } = userInfo;
    return `
        <div class="index-section">
            <h1 class="header">Welcome,</h1><p class="paragraph-center">${userName}</p><p class="paragraph-center-small" style="margin-top: -12px;">${company}</p>
            <hr class="hr-small">
            <div class="space-x-big"></div>
            <div class="index-section-fadein">
                <p class="paragraph-center-big">No Upcoming Meetings!</p>
                <img class="tea-icon" src="../../graphic/teaIcon.svg" />
            </div>
        </div>
    `;
}