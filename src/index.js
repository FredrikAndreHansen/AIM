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
// Continue on formatting the time (#formatTime function). 
    // Format hour and checkMinutes correctly, they need to get the last word in the string! in 01_getOutputByVoiceModel.js in the #formatTimeSaidConventional function!
    // #Add it so that duplicate times will be merged! 
    // #Format on the contrary, if you use pm, then add that if you say 14, change it to 2 pm!
    // #Validate time in the #validateMeetings function (time should not be in the past! Only validate time if the day are the current day!)
// When scheduling:
    // 3. Times (max 15 per date)
    // 4. meeting name (optional), meeting length(standard 30 minutes), adding link to join meeting(optional)
    // 5. Get a list of all users (so that you can discard users for the meeting(in case someone is sick!)) (optional)
    // 6. Confirm, change the proceed button to a green button that says "Create Meeting"

    // Pending meeting result page, it will also appear in the notification menu (for all affected users!) Meetings will appear first in the notification menu!
    // After creating meeting by inviting by teams, voice and users, make it so that you can go back in the pages and keep the data! The data is reset when going back from add a meeting by voice!

// After scheduling a meeting it will then show as a upcoming meeting in the notification menu(for all users), it will automatically dissapear when the date past the meeting end time!
// Edit a meeting - meeting name (optional), meeting length(optional), adding link to join meeting(optional), or delete the meeting (Only the meeting creator can delete the meeting)

// ## Main menu
// Settings in main menu
    // Change username
    // Change company name
    // Change password
    // Change email
    // Always signed in or sign out when removing the app
    // Subscribe - Change all subscribe error message to go to this page instead of nomad.co.uk! (integrate with PayPal and stripe)
    // Delete account, inform that all user data will be removed from the server

// Check to integrate with Google calendar and perhaps Microsoft/Outlook calendar, to automatically add it in! Add to Settings in the main menu, and also as a popup for the first time when accepting a meeting schedule, or when creating a meeting! Create a value in the user configuration object

// Check to get badge notifications without opening, if possible then also automatically open app when getting a meeting notification(have a setting to also disable it also)
// Check for rights to enable microphone through the app, if so then change the error message when microphone is disabled! (in addMeetingByVoice in mettingMode.js)

// Check to add email verification when registering new users