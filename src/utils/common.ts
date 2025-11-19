/**
 * Recursively removes falsy values from an object while preserving nested structures.
 *
 * @param obj - The object to clean.
 * @returns A new object containing only truthy values.
 */
const cleanObject = (obj: Record<string, any>): Record<string, any> => {
    const newObj: Record<string, any> = {};

    for (const key in obj) {
        if (obj[key]) {
            const value = obj[key];

            // Check for falsy values
            if (value) {
                // Handle nested objects
                if (typeof value === 'object' && !Array.isArray(value)) {
                    const cleanedValue = cleanObject(value);
                    if (Object.keys(cleanedValue).length > 0) {
                        newObj[key] = cleanedValue;
                    }
                }
                // Handle arrays
                else if (Array.isArray(value)) {
                    const cleanedArray = value
                        .map((item) => (typeof item === 'object' ? cleanObject(item) : item))
                        .filter((item) => item); // Filter out falsy items
                    if (cleanedArray.length > 0) {
                        newObj[key] = cleanedArray;
                    }
                } else {
                    newObj[key] = value;
                }
            }
        }
    }

    return newObj;
};

/**
 * Removes falsy values from an object or array, recursively cleaning nested objects.
 * Note: This removes ALL falsy values including 0, false, '', null, undefined, and NaN.
 * If you need to preserve 0 or false, consider a different approach.

 * 
 * @param obj - The value to clean.
 * @returns A new instance containing only truthy values.
 */
export const removeFalsyValues = (obj: any[] | Record<string, any>) => {
    if (Array.isArray(obj)) {
        return obj.map((item) => (typeof item === 'object' ? cleanObject(item) : item)).filter((item) => item); // Filter out falsy items
    }
    return cleanObject(obj);
};
