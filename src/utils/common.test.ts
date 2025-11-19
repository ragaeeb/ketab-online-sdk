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

    it('should clean array values', () => {
        const result = removeFalsyValues(['', 'value', undefined, { drop: '', keep: 'value' }]);
        expect(result).toEqual(['value', { keep: 'value' }]);
    });
});
