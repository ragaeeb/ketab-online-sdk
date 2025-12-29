/**
 * Recursively removes falsy values from an object while preserving nested structures.
 *
 * @param obj - The object to clean.
 * @returns A new object containing only truthy values.
 */
const cleanObject = (obj: Record<string, any>): Record<string, any> => {
    const newObj: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (!value) {
            continue;
        }

        if (Array.isArray(value)) {
            const cleanedArray = value
                .map((item) => (typeof item === 'object' && item !== null ? cleanObject(item) : item))
                .filter(Boolean);

            if (cleanedArray.length > 0) {
                newObj[key] = cleanedArray;
            }
        } else if (typeof value === 'object') {
            const cleanedValue = cleanObject(value);
            if (Object.keys(cleanedValue).length > 0) {
                newObj[key] = cleanedValue;
            }
        } else {
            newObj[key] = value;
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
