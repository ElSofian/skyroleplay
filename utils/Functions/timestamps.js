module.exports = class Timestamps {

    constructor(client, options) {
        this.client = client;
        this.options = options;
    }
    
    dateToTimestamp = (date) => {
        if(typeof date !== "string") throw new Error("The date parameter in the function 'dateToTimestamp()' must be a string.");
        const [day, month, year, hours, minutes] = date.split(/\/| |:/); 
        return new Date(new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`).getTime());
    }

    dateToMS = (date) => {
        if(typeof date !== "string") throw new Error("The date parameter in the function 'dateToMs()' must be a string.");  
        const [day, month, year, hours, minutes] = date.split(/\/| |:/);
        return new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`).getTime();
    }

    msToTimestamp = (ms) => {
        if(typeof ms !== "number") throw new Error("The ms parameter in the function 'msToTimestamp()' must be a number.");
        const date = new Date(ms);
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return new Date(new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`).getTime());
    }

    msToDate = (ms) => {
        if(typeof ms !== "number") throw new Error("The ms parameter in the function 'msToDate()' must be a number.");
        const date = new Date(ms);
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    
}
