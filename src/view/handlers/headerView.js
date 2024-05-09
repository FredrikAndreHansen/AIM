export function headerView(isLoggedIn) { 
    if (isLoggedIn === true) {
        return `
            <menu class="main-menu">
                <div class="main-menu-logo-clicked"></div>
                <menuitem title="Notifications" id="main-menu-logo"></menuitem>

                <div class="main-menu-users-clicked"></div>
                <menuitem title="Manage Users" id="main-menu-users"></menuitem>

                <div class="main-menu-teams-clicked"></div>
                <menuitem title="Manage Teams" id="main-menu-teams"></menuitem>
                
                <div class="main-menu-meeting-clicked"></div>
                <menuitem title="Schedule a Meeting" id="main-menu-meeting"></menuitem>
                
                <menuitem title="Sign Out" id="main-menu-sign-out"></menuitem>

                <div id="menu-alerts"></div>
            </menu>
        `;
    } else {
        return `
            <img class="header-icon" src="./graphic/logo.png" alt="Header Icon" />
        `;
    }
}