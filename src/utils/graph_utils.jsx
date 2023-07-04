//this file will contain all utility functions related to graph

//function that will check if a given value that can be an array or a string is equal to a given string value , return true if it is equal
export const checkIfValueIsEqual = (value, valueToCompare) => {
    if (Array.isArray(value)) {
        return value.includes(valueToCompare);
    } else {
        return value === valueToCompare;
    }
    }