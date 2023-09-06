import { popupDOMElement } from "../index.js";
import { successView } from '../view/successView.js';
import { LoadController } from './loadController.js';

export class SuccessController {

    displaySuccessMessage(successMessage) {
        popupDOMElement.innerHTML = '';
        const errorDOMElement = document.querySelector('#error');
        errorDOMElement.innerHTML = successView(successMessage);
        
        this.#close();

        const loadController = new LoadController();
        loadController.removeLoading();
    }
    
    // Close the success message on click
    #close() {
        const errorDOMElement = document.querySelector('#error');
        errorDOMElement.addEventListener('click', function() {
            errorDOMElement.innerHTML = '';
        });
    }

}