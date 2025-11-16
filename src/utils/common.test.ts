import { describe, expect, test } from 'bun:test';

import { removeFalsyValues } from './common';

describe('removeFalsyValues', () => {
    test('cleans nested objects and arrays', () => {
        const input = {
            nested: {
                valid: 'value',
                nestedArray: [1, { keep: 'yes', drop: undefined }],
            },
            list: [
                {
                    keep: 'value',
                    drop: '',
                },
                undefined,
            ],
        };

        const result = removeFalsyValues(input);

        expect(result).toEqual({
            nested: {
                valid: 'value',
                nestedArray: [1, { keep: 'yes' }],
            },
            list: [{ keep: 'value' }],
        });
    });

    test('cleans array values', () => {
        const result = removeFalsyValues(['', 'value', undefined, { keep: 'value', drop: '' }]);
        expect(result).toEqual(['value', { keep: 'value' }]);
    });
});
