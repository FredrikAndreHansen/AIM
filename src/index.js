import { GET_TOKEN, HAS_INTERNET_CONNECTION } from './helpers/helpers.js';
import { initApp, initSignedOut, initOffline } from './libraries/init.js';

export const viewDOMElement = document.querySelector('#view');
export const headerDOMElement = document.querySelector('#header');
export const popupDOMElement = document.querySelector('#popup');
export const errorDOMElement = document.querySelector('#error');

let isLoggedIn = false;

if (GET_TOKEN()) {
    isLoggedIn = true;
}

if (HAS_INTERNET_CONNECTION()) {
    if (isLoggedIn === true) {
        initApp();
    } else {
        initSignedOut();
    }
} 
else {
    initOffline();
}

// Todo

// ## Users menu
// When sorting for blocked users, have it toggle to sort back to all users when sorting by blocked users

// Add a check in inviteUserToTeam in IndividualUserModel to see if the user is already invited!
// Add in TeamsController to init after user invite!

// ## Schedule meeting
// If the user is not allowed to schedule a meeting, then remove the team from the schedule meeting menu!
// When scheduling:
    // 1. Date (max 3 dates)
    // 2. Times (max 5 per date)
    // 3. Select team (Remove team if the "allowed to schedule meetings" is set to false!)
    // 4. Get a list of all users (so that you can discard users for the meeting(in case someone is sick!))
    // 5. meeting name (optional), meeting length(optional), adding link to join meeting(optional)
    // Pending meeting result page, it will also appear in the notification menu (for all affected users!) Meetings will appear first in the notification menu!

// After scheduling a meeting it will then show as a upcoming meeting in the notification menu(for all users), it will automatically dissapear when the date past the meeting end time!
// Edit a meeting - meeting name (optional), meeting length(optional), adding link to join meeting(optional)

// ## Main menu
// Settings in main menu
    // Change username
    // Change company name
    // Change password
    // Change email
    // Always signed in or sign out when removing the app
    // Dark and Light mode
    // Delete account, inform that all user data will be removed from the server

// Check to integrate with Google calendar and perhaps Microsoft/Outlook calendar, to automatically add it in! Add to Settings in the main menu, and also as a popup for the first time when accepting a meeting schedule, or when creating a meeting! Create a value in the user configuration object

// Check to get badge notifications without opening, if possible then also automatically open app when getting a meeting notification(have a setting to also disable it also)

// Check to add email verification when registering new users