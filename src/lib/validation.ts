/**
 * Validation class
 */
export default class Validation {
    success: boolean;
    message: string;
    /**
     * Creates a new validation object
     * @param success If validation was successful
     * @param message The validation message, if failed
     */
    constructor(success: boolean = true, message: string = ""){
        this.success = success;
        this.message = message;
    }
}