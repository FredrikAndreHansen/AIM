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

// ## Teams menu
// Add when "allAllowedToRemoveUsers" and "allAllowedToRemovePendingInvites" the memebers are grayed out! (Check individualTeamModel.js in the generateTeamUsersOutput() function with the config object!)
// Settings (only for admin): 
    // Rename team
    // Set team rules (allow to add users, allow to remove users, allow to remove pending invites, allowed to schedule meetings)
    // Delete team
// Cant kick admin users! (Have admins grayed out)
// Kick members and pending invites (Remove the eventlistener for clicking on the members/pending invites if "allAllowedToRemoveUsers" and "allAllowedToRemovePendingInvites" are set to false!)

// ## Users menu
// Invite users to teams via the User menu (Can only see teams that you are allowed to invite) - If no teams available then the invite button will dissapear!

// ## Schedule metting
// After scheduling a meeting you can select to keep the meeting or discard it (If kept it will then show as a upcoming meeting in the notification menu, it will automatically dissapear when the date past the meeting end time!)
// When scheduling:
    // Date, start and end time of meeting
    // Select team (Remove team if the "allowed to schedule meetings" is set to false!)
    // Get a list of all users (so that you can discard users for the meeting(in case someone is sick!))
    // Pending meeting result page, it will also appear in the notification menu (for all affected users!) Meetings will appear first in the notification menu!

// ## Main menu
// Settings in main menu
    // Change username
    // Change company name
    // Change password
    // Change email
    // Always signed in or sign out when removing the app
    // Delete account, inform that all user data will be removed from the server