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

export const removeFalsyValues = (obj: any[] | Record<string, any>) => {
    if (Array.isArray(obj)) {
        return obj.map((item) => (typeof item === 'object' ? cleanObject(item) : item)).filter((item) => item); // Filter out falsy items
    }
    return cleanObject(obj);
};
