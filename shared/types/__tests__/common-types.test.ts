/**
 * Type safety tests for common type definitions
 * These tests verify the new common interfaces work correctly
 */

import { NextRequest } from 'next/server';
import {
  ComponentProps,
  FormHandlerParams,
  FormHandlerResult,
  FormValidationError,
  EnhancedApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../../types/common';

// Test ComponentProps interface
describe('ComponentProps Interface', () => {
  it('should extend ComponentBaseProps with accessibility properties', () => {
    const componentProps: ComponentProps = {
      className: 'test-class',
      children: 'Test content',
      disabled: false,
      id: 'test-id',
      testId: 'test-component',
      'data-testid': 'component-test',
      'aria-label': 'Test component',
      'aria-describedby': 'description-id',
      role: 'button',
    };

    expect(componentProps.className).toBe('test-class');
    expect(componentProps.id).toBe('test-id');
    expect(componentProps['aria-label']).toBe('Test component');
    expect(componentProps.role).toBe('button');
  });

  it('should allow minimal component props', () => {
    const minimalProps: ComponentProps = {};
    
    expect(minimalProps.className).toBeUndefined();
    expect(minimalProps.children).toBeUndefined();
    expect(minimalProps.disabled).toBeUndefined();
  });
});

// Test FormHandlerParams interface
describe('FormHandlerParams Interface', () => {
  it('should accept typed data and NextRequest', () => {
    interface TestFormData {
      name: string;
      email: string;
    }

    const mockRequest = {} as NextRequest;
    const formParams: FormHandlerParams<TestFormData> = {
      data: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      req: mockRequest,
    };

    expect(formParams.data.name).toBe('John Doe');
    expect(formParams.data.email).toBe('john@example.com');
    expect(formParams.req).toBe(mockRequest);
  });

  it('should work with generic Record type', () => {
    const mockRequest = {} as NextRequest;
    const genericParams: FormHandlerParams = {
      data: {
        field1: 'value1',
        field2: 42,
        field3: true,
      },
      req: mockRequest,
    };

    expect(genericParams.data.field1).toBe('value1');
    expect(genericParams.data.field2).toBe(42);
    expect(genericParams.data.field3).toBe(true);
  });
});

// Test FormHandlerResult type
describe('FormHandlerResult Type', () => {
  it('should handle success result', () => {
    interface TestData {
      id: string;
      name: string;
    }

    const successResult: FormHandlerResult<TestData> = {
      success: true,
      data: {
        id: '123',
        name: 'Test Item',
      },
      message: 'Operation successful',
    };

    expect(successResult.success).toBe(true);
    if (successResult.success && successResult.data) {
      expect(successResult.data.id).toBe('123');
      expect(successResult.message).toBe('Operation successful');
    }
  });

  it('should handle error result with validation errors', () => {
    const validationErrors: FormValidationError[] = [
      {
        field: 'email',
        message: 'Invalid email format',
        code: 'INVALID_EMAIL',
      },
      {
        field: 'password',
        message: 'Password too short',
        code: 'PASSWORD_LENGTH',
      },
    ];

    const errorResult: FormHandlerResult<never> = {
      success: false,
      error: 'Validation failed',
      validationErrors,
    };

    expect(errorResult.success).toBe(false);
    if (!errorResult.success) {
      expect(errorResult.error).toBe('Validation failed');
      expect(errorResult.validationErrors).toHaveLength(2);
      expect(errorResult.validationErrors?.[0].field).toBe('email');
    }
  });
});

// Test EnhancedApiResponse types
describe('EnhancedApiResponse Types', () => {
  it('should handle success response', () => {
    interface UserData {
      id: string;
      name: string;
    }

    const successResponse: ApiSuccessResponse<UserData> = {
      success: true,
      data: {
        id: '123',
        name: 'John Doe',
      },
      message: 'User retrieved successfully',
      timestamp: new Date().toISOString(),
    };

    expect(successResponse.success).toBe(true);
    expect(successResponse.data.id).toBe('123');
    expect(successResponse.message).toBe('User retrieved successfully');
  });

  it('should handle error response', () => {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'User not found',
      code: 'USER_NOT_FOUND',
      details: { userId: '123' },
      timestamp: new Date().toISOString(),
    };

    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toBe('User not found');
    expect(errorResponse.code).toBe('USER_NOT_FOUND');
  });

  it('should work with union type', () => {
    interface TestData {
      value: string;
    }

    const responses: EnhancedApiResponse<TestData>[] = [
      {
        success: true,
        data: { value: 'test' },
      },
      {
        success: false,
        error: 'Something went wrong',
      },
    ];

    expect(responses).toHaveLength(2);
    expect(responses[0].success).toBe(true);
    expect(responses[1].success).toBe(false);
  });
});

// Test FormValidationError interface
describe('FormValidationError Interface', () => {
  it('should have required field and message', () => {
    const validationError: FormValidationError = {
      field: 'username',
      message: 'Username is required',
    };

    expect(validationError.field).toBe('username');
    expect(validationError.message).toBe('Username is required');
    expect(validationError.code).toBeUndefined();
  });

  it('should support optional code', () => {
    const validationError: FormValidationError = {
      field: 'email',
      message: 'Invalid email format',
      code: 'INVALID_FORMAT',
    };

    expect(validationError.code).toBe('INVALID_FORMAT');
  });
});

// Type compatibility tests
describe('Type Compatibility', () => {
  it('should be compatible with existing patterns', () => {
    // Test that new types work with existing code patterns
    const handleFormSubmission = (params: FormHandlerParams<{ name: string }>) => {
      return params.data.name;
    };

    const mockRequest = {} as NextRequest;
    const result = handleFormSubmission({
      data: { name: 'Test' },
      req: mockRequest,
    });

    expect(result).toBe('Test');
  });

  it('should support component composition', () => {
    const createComponent = (props: ComponentProps) => {
      return {
        className: props.className || 'default',
        accessible: !!(props['aria-label'] || props.role),
      };
    };

    const component = createComponent({
      className: 'custom-class',
      'aria-label': 'Custom component',
    });

    expect(component.className).toBe('custom-class');
    expect(component.accessible).toBe(true);
  });
});
