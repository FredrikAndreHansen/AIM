import { errorView } from '../view/errorView.js';
import { LoadController } from './loadController.js';

export class ErrorController {

    displayErrorMessage(errorMessage) {
        const errorDOMElement = document.querySelector('#error');
        errorDOMElement.innerHTML = errorView(errorMessage);
        
        this.#close();

        const loadController = new LoadController();
        loadController.removeLoading();
    }

    // Close the error message on click
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