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
// Invite users to teams via the User menu

// ##Teams menu
// Settings: 
    // Rename team
    // Set team rules (allow to add users, allow to remove users, allowed to schedule meetings)
    // Delete team
// Kick pending invites & members

// ## Schedule metting
// After scheduling a meeting you can select to keep the meeting or discard it (If kept it will then show as a upcoming meeting in the notification menu, it will automatically dissapear when the date past the meeting end time!)
// When scheduling:
    // Date, start and end time of meeting
    // Select team
    // Get a list of all users (so that you can discard users for the meeting(in case someone is sick!))
    // Pending meeting result page, it will also appear in the notification menu (for all affected users!)

// ## Main menu
// Have a notification when declining a meeting
// Settings in main menu
    // Change username
    // Change company name
    // Change password
    // Change email
    // Always signed in or sign out when removing the app
    // Delete account, inform that all user data will be removed from the server