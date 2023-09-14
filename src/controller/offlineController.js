import { viewDOMElement } from "../index.js";
import { offlineView } from "../view/handlers/offlineView.js";
import { removeLoading } from "../libraries/load.js";
import { SET_INNER_HTML_VALUE } from "../helpers/helpers.js";

export class OfflineController {

    setView() {
        this.#generateOutput();

        removeLoading();
    }

    #generateOutput() {
        SET_INNER_HTML_VALUE({set: viewDOMElement, to: offlineView});
    }

}
