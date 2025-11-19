import { describe, expect, it } from 'bun:test';

import { removeFalsyValues } from './common';

describe('removeFalsyValues', () => {
    it('should clean nested objects and arrays', () => {
        const input = {
            list: [
                {
                    drop: '',
                    keep: 'value',
                },
                undefined,
            ],
            nested: {
                nestedArray: [1, { drop: undefined, keep: 'yes' }],
                valid: 'value',
            },
        };

        const result = removeFalsyValues(input);

        expect(result).toEqual({
            list: [{ keep: 'value' }],
            nested: {
                nestedArray: [1, { keep: 'yes' }],
                valid: 'value',
            },
        });
    });

    it('should handle various falsy values correctly', () => {
        const input = {
            emptyString: '',
            falseBool: false,
            nanValue: NaN,
            nullValue: null,
            undefined: undefined,
            validString: 'keep',
            zero: 0,
        };

        const result = removeFalsyValues(input);

        // Clarify expected behavior: should 0 and false be removed?
        expect(result).toEqual({ validString: 'keep' });
    });

    it('should clean array values', () => {
        const result = removeFalsyValues(['', 'value', undefined, { drop: '', keep: 'value' }]);
        expect(result).toEqual(['value', { keep: 'value' }]);
    });
});
