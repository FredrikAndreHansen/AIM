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

// ## Schedule meeting
// Rearrange MeetingsFlow in views! The meetingView.js now contain the views for when you create a meeting with teams, create meetingByTeamView and add it there!
// When scheduling:
    // 3. Times (max 15 per date)
    // 4. meeting name (optional), meeting length(standard 30 minutes), adding link to join meeting(optional)
    // 5. Get a list of all users (so that you can discard users for the meeting(in case someone is sick!)) (optional)
    // 6. Confirm, change the proceed button to a green button that says "Create Meeting"
    // Pending meeting result page, it will also appear in the notification menu (for all affected users!) Meetings will appear first in the notification menu!

// After scheduling a meeting it will then show as a upcoming meeting in the notification menu(for all users), it will automatically dissapear when the date past the meeting end time!
// Edit a meeting - meeting name (optional), meeting length(optional), adding link to join meeting(optional), or delete the meeting (Only the meeting creator and team admin can edit the meeting)

// ## Main menu
// Settings in main menu
    // Change username
    // Change company name
    // Change password
    // Change email
    // Always signed in or sign out when removing the app
    // Subscribe - Change all subscribe error message to go to this page instead of nomad.co.uk!
    // Delete account, inform that all user data will be removed from the server

// Check to integrate with Google calendar and perhaps Microsoft/Outlook calendar, to automatically add it in! Add to Settings in the main menu, and also as a popup for the first time when accepting a meeting schedule, or when creating a meeting! Create a value in the user configuration object

// Check to get badge notifications without opening, if possible then also automatically open app when getting a meeting notification(have a setting to also disable it also)

// Check to add email verification when registering new users