import { displayErrorMessage } from "../controller/errorController.js";
import { removeToken } from "./userToken.js";

export async function fetchUserInfo() {
    validateIfLoggedIn();
    const userId = localStorage.getItem('AIMNomadToken');
    const dbRef = firebase.database().ref();

    return await new Promise(function(resolve, reject) {
        dbRef.child("users").child(userId).get().then((snapshot) => {
        if (snapshot.exists()) {
            const user = snapshot.val();
            resolve([user.username, user.company]);
        } else {
            displayErrorMessage("No data available!");
            reject();
        }
        }).catch((error) => {
            displayErrorMessage(error);
        })
    })
}

export async function fetchAllUsers() {
    validateIfLoggedIn();
    const starCountRef = firebase.database().ref('users/');
    let HTMLInput = '';

    return await new Promise(function(resolve, reject) {
        let i = 0;
        starCountRef.on('value', (snapshot) => {
            const users = snapshot.val();
            for (const key in users) {
                HTMLInput += `<tr><td><p class="paragraph-center">${users[key].username}</p><hr class="hr-x-small" style="margin-top: -8px;"><p class="paragraph-center-small" style="margin-top: -6px;">${users[key].company}</p></td></tr>`;
                i++;
                if (i > 999) { break };
            }
            resolve(HTMLInput);
        });
    })
}

function validateIfLoggedIn() {
    const userId = localStorage.getItem('AIMNomadToken');
    const dbRef = firebase.database().ref();

    dbRef.child("users").child(userId).get().then((snapshot) => {
        if (!snapshot.exists()) {
            removeToken();
        }     
    });
}