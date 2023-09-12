import { teamsOutputView, noTeams } from "../../view/app/teamsView.js";
import { LoadController } from "../../controller/handlers/loadController.js";
import { HandlerController } from "../../controller/handlers/handlerController.js";
import { TeamsController } from "../../controller/app/teamsController.js";
import { AuthHelper } from "../../helpers/auth.js";
import { EncryptHelper } from "../../helpers/encrypt.js";
import { GET_USER_ID, GET_DB_REFERENCE, GET_DB_USERS_INFO, SALT, IF_EXISTS, GET_VALUE, USERS_GET_CHILD_REF, TEAMS_GET_CHILD_REF, GET_DB_TEAMS_INFO } from "../../helpers/helpers.js";

const handlerController = new HandlerController();
const encryptHelper = new EncryptHelper();
const authHelper = new AuthHelper();
const loadController = new LoadController();

export class TeamsModel {

    async getTeams() {
        authHelper.validateIfLoggedIn();

        const currentUserId = GET_USER_ID();
        const dbRef = GET_DB_REFERENCE();

        return await new Promise((resolve, reject) => {

            SALT().then((salt) => {
                const decrypt = encryptHelper.decipher(salt);
                const decryptedCurrentUserId = decrypt(currentUserId);

                GET_DB_USERS_INFO(dbRef, decryptedCurrentUserId).then((userTeams) => {
                    if (IF_EXISTS(userTeams)) {
                        GET_DB_TEAMS_INFO(dbRef).then((allTeams) => {
                            const HTMLOutput = this.#checkTeams(userTeams, allTeams, salt);

                            loadController.removeLoading();

                            resolve(HTMLOutput);
                        })
                    } else {
                        loadController.removeLoading();
                        reject(handlerController.throwError("No data available!"));
                    }     
                }).catch((error) => {
                    loadController.removeLoading();
                    handlerController.displayMessage({message: error, isError: true});
                });
            });
        });
    }

    #checkTeams(getUserTeams, allTeams, salt) {
        const user = GET_VALUE(getUserTeams);
        const userTeams = Object.values(user.teams);

        const teams = GET_VALUE(allTeams);
        const getTeamInfo = Object.values(teams);
        const getAllTeamsById = Object.keys(teams);

        const encrypt = encryptHelper.cipher(salt);

        let HTMLOutput = '';
        let isEmpty = true;

        for(let i = 0; i < userTeams.length; i++) {
            for(let ii = 0; ii < getAllTeamsById.length; ii++) {
                if (userTeams[i] === getAllTeamsById[ii]) {
                    HTMLOutput += teamsOutputView({
                        encryptedKey: encrypt(getAllTeamsById[ii]), 
                        team: getTeamInfo[ii][1],
                        usersInTeam: getTeamInfo[ii][2].length
                    });
                    isEmpty = false;
                }
            }
        }
        if (isEmpty === true) {
            HTMLOutput = noTeams;
        }

        return HTMLOutput;
    }

    async addTeam(teamName) {
        authHelper.validateIfLoggedIn();

        const currentUserId = GET_USER_ID();
        const dbRef = GET_DB_REFERENCE();

        return await new Promise((resolve, reject) => {

            SALT().then((salt) => {
                const decrypt = encryptHelper.decipher(salt);
                const decryptedCurrentUserId = decrypt(currentUserId);

                GET_DB_USERS_INFO(dbRef, decryptedCurrentUserId).then((snapshot) => {
                    if (IF_EXISTS(snapshot)) {
                        resolve(this.#pushNewTeamToDB(decryptedCurrentUserId, teamName));

                        handlerController.displayMessage({message: teamName + " was successfully created!", isError: false});

                        const teamsController = new TeamsController();
                        teamsController.generateOutput();

                        loadController.removeLoading();
                    } else {
                        loadController.removeLoading();
                        reject(handlerController.throwError("No data available!"));
                    }  
                }).catch((error) => {
                    loadController.removeLoading();
                    handlerController.displayMessage({message: error, isError: true});
                });
            });
        });
    }

    #pushNewTeamToDB(userId, teamName) {
        const dbRef = GET_DB_REFERENCE();
        const addTeam = dbRef.child(TEAMS_GET_CHILD_REF).push([userId, teamName, [userId]]);
        const getKey = addTeam.getKey();
        const addTeamToUser = dbRef.child(USERS_GET_CHILD_REF).child(userId).child(TEAMS_GET_CHILD_REF).push(getKey);

        return addTeamToUser;
    }

}