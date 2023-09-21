export class IndividualTeamController {

    constructor(authDependencies, helpers, views) {
        this.authDependencies = authDependencies;
        this.helpers = helpers;
        this.views = views;
    }

    setView(teamName) {
        this.authDependencies.validateIfLoggedIn();

        this.#generateOutput(teamName);
    }

    #generateOutput(teamName) {
        this.helpers.SET_INNER_HTML_VALUE({set: this.views.viewDOMElement, to: this.views.individualTeamView(teamName)});
    }

}