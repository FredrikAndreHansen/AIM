import { loadView } from '../view/loadView.js';

export class LoadController {

    displayLoading() {
        const loadDOMElement = document.querySelector('#load');
        const load = loadView;
        loadDOMElement.innerHTML = load;
    }

    removeLoading() {
        const loadDOMElement = document.querySelector('#load');
        loadDOMElement.innerHTML = '';
    }

}