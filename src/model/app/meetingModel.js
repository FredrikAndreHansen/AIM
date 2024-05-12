export class MeetingModel {

    constructor() {}

    canProceed(ifUserCanProceed) {
        const proceedDOMElement = document.querySelector('#proceed');

        if (ifUserCanProceed === true) {
            if (proceedDOMElement.classList.contains('none')){
                proceedDOMElement.classList.remove('none');
            }
        } else {
            if (!proceedDOMElement.classList.contains('none')) {
                proceedDOMElement.classList.add('none');
            }
        }
    }

    formatDateOutput(date) {
        const year = this.setDateVariables(date).year;
        const month =  this.setDateVariables(date).month;
        const day =  this.setDateVariables(date).day;
        const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = allMonths[month-1];

        return currentMonth + ' ' + day + ', ' + year;
    }

    setDateVariables(date) {
        const dateArray = date.split("-");

        const year = dateArray[0];
        const month = dateArray[1];
        const day = dateArray[2];

        return {
            year: year,
            month: month,
            day: day
        };
    }

}