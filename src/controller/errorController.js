import { popupDOMElement } from "../index.js";
import { errorView } from '../view/errorView.js';
import { LoadController } from './loadController.js';

export class ErrorController {

    displayErrorMessage(errorMessage) {
        popupDOMElement.innerHTML = '';
        const errorDOMElement = document.querySelector('#error');
        errorDOMElement.innerHTML = errorView(errorMessage);
        
        this.#close();

        const loadController = new LoadController();
        loadController.removeLoading();
    }

    #close() {
        const errorDOMElement = document.querySelector('#error');
        errorDOMElement.addEventListener('click', function() {
            errorDOMElement.innerHTML = '';
        });
    }

    throwError(errorMessage) {
        const error = new Error(errorMessage);
        throw error.message;
    }

}