import { ValidationErrorItem } from "joi";

const getErrorsInArray = (errors: ValidationErrorItem[]): Record<string, string>[] => {
    return errors.map((error) => {
        const key = error.context?.key || "unknown"; // Handle undefined keys safely
        const message = error.message;
        return { [key]: message };
    });
};

export default getErrorsInArray;
