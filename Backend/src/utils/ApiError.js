class ApiError extends Error {
    constructor(statusCode,message="Something went Wrong",errors=[],stack="") {
        super(message); // Call super before using this
        this.statusCode = statusCode;
        this.errors = errors;
        this.message = message;
        this.success = false;
        this.data = null; // Removed the extra comma
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
export {ApiError};