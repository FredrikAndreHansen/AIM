import { successView } from '../view/successView.js';
import { LoadController } from './loadController.js';

export class SuccessController {

    displaySuccessMessage(successMessage) {
        const errorDOMElement = document.querySelector('#error');
        errorDOMElement.innerHTML = successView(successMessage);
        this.close();
        // Initialize classes
        const loadController = new LoadController();
        loadController.removeLoading();
    }
    
    // Close the success message on click
    close() {
        const errorDOMElement = document.querySelector('#error');
        errorDOMElement.addEventListener('click', function() {
            errorDOMElement.innerHTML = '';
        });
    }

}