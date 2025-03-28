import { ValidationOptions } from "joi";

export const joiOptions: ValidationOptions = {
    abortEarly: false,
    errors: {
        wrap: {
            label: false, // Ensures labels are not wrapped in quotes
        },
    },
};
