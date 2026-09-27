/**
 * Error Handler Utility
 * 
 * Wraps async functions with error handling.
 * 
 * @module app/api/shared/utils/errHandler
 */

export const withErrorHandling = <Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
): ((...args: Args) => Promise<Result>) => {
  return async (...args: Args): Promise<Result> => {
    try {
      return await fn(...args);
    } catch (err) {
      throw new Error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
};
