/**
 * Tests pour les fonctions utilitaires helpers
 */
import { isEmpty, formatLaravelErrors } from '../utils/helpers';

describe('helpers', () => {
    describe('isEmpty', () => {
        it('should return true for null', () => {
            expect(isEmpty(null)).toBe(true);
        });

        it('should return true for undefined', () => {
            expect(isEmpty(undefined)).toBe(true);
        });

        it('should return true for empty string', () => {
            expect(isEmpty('')).toBe(true);
        });

        it('should return true for whitespace only string', () => {
            expect(isEmpty('   ')).toBe(true);
        });

        it('should return false for non-empty string', () => {
            expect(isEmpty('hello')).toBe(false);
        });

        it('should return true for empty array', () => {
            expect(isEmpty([])).toBe(true);
        });

        it('should return false for non-empty array', () => {
            expect(isEmpty([1, 2, 3])).toBe(false);
        });

        it('should return true for empty object', () => {
            expect(isEmpty({})).toBe(true);
        });

        it('should return false for non-empty object', () => {
            expect(isEmpty({ key: 'value' })).toBe(false);
        });
    });

    describe('formatLaravelErrors', () => {
        it('should format Laravel validation errors to single messages', () => {
            const errors = {
                email: ['The email field is required.', 'The email must be valid.'],
                password: ['The password field is required.']
            };

            const result = formatLaravelErrors(errors);

            expect(result).toEqual({
                email: 'The email field is required.',
                password: 'The password field is required.'
            });
        });

        it('should handle empty errors object', () => {
            const errors = {};
            const result = formatLaravelErrors(errors);
            expect(result).toEqual({});
        });

        it('should handle single error per field', () => {
            const errors = {
                name: ['Name is required.']
            };

            const result = formatLaravelErrors(errors);

            expect(result).toEqual({
                name: 'Name is required.'
            });
        });
    });
});
