import { loadView } from '../../view/handlers/loadView.js';
import { SET_INNER_HTML_VALUE } from '../../helpers/helpers.js';

export class LoadController {

    displayLoading() {
        const loadDOMElement = document.querySelector('#load');
        const load = loadView;
        SET_INNER_HTML_VALUE({set: loadDOMElement, to: load});
    }

    removeLoading() {
        const loadDOMElement = document.querySelector('#load');
        SET_INNER_HTML_VALUE({set: loadDOMElement, to: 'clear'});
    }

}