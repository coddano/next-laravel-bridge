/**
 * Tests pour les utilitaires de validation
 */
import { formatValidationErrors, LaravelValidationErrors } from '../forms/validation';

describe('validation', () => {
    describe('formatValidationErrors', () => {
        it('should return the same errors object', () => {
            const errors: LaravelValidationErrors = {
                email: ['Email is required', 'Email must be valid'],
                password: ['Password is required']
            };

            const result = formatValidationErrors(errors);

            expect(result).toEqual(errors);
        });

        it('should handle empty errors', () => {
            const errors: LaravelValidationErrors = {};
            const result = formatValidationErrors(errors);
            expect(result).toEqual({});
        });

        it('should handle nested field errors', () => {
            const errors: LaravelValidationErrors = {
                'user.name': ['Name is required'],
                'user.email': ['Email is required']
            };

            const result = formatValidationErrors(errors);

            expect(result).toEqual({
                'user.name': ['Name is required'],
                'user.email': ['Email is required']
            });
        });
    });

    describe('LaravelValidationErrors type', () => {
        it('should allow string array values', () => {
            const errors: LaravelValidationErrors = {
                field1: ['Error 1', 'Error 2'],
                field2: ['Error 3']
            };

            expect(errors.field1).toHaveLength(2);
            expect(errors.field2).toHaveLength(1);
        });
    });
});
