import { loadView } from '../view/loadView.js';

export function displayLoading() {
    document.body.style.overflow = "auto";
    //document.body.style.backgroundColor = "red";
    const loadDOMElement = document.querySelector('#load');
    const load = loadView();
    loadDOMElement.innerHTML = load;
}

export function removeLoading() {
    const loadDOMElement = document.querySelector('#load');
    loadDOMElement.innerHTML = '';
}