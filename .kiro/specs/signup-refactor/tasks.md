# Implementation Plan

- [ ] 1. Create reusable PasswordInput component

  - Create components/ui/PasswordInput.tsx with TypeScript interfaces (check old/PassportInput for ideas, it needs to be converted to shadcn and tailwind)
  - Implement password visibility toggle functionality with eye icon
  - Add password strength calculation utility function
  - Create PasswordStrengthMeter component with visual feedback
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 2. Implement password strength calculation logic

  - Create utility function to calculate password strength score (0-4)
  - Implement requirements checking (length, uppercase, lowercase, number, special)
  - Add debounced strength calculation to prevent excessive re-renders
  - Generate helpful feedback messages for password improvement
  - _Requirements: 3.1, 3.2_

- [ ] 3. Update signup page with SignedIn/SignedOut pattern

  - Import SignedIn, SignedOut, UserInfo, SignOutButton from Nile
  - Add conditional rendering for already signed-in users
  - Implement "Go to Dashboard" button for signed-in users
  - Display user information when already authenticated
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 4. Simplify form structure and remove business logic

  - Remove all signup type selection UI (radio buttons)
  - Remove PlanSelect component and plan-related logic
  - Remove company code fields and business-related state
  - Remove URL parameter handling for companyId and plan
  - _Requirements: 1.1, 5.1_

- [ ] 5. Implement simplified form with password confirmation

  - Create form with react-hook-form using email, password, confirmPassword fields
  - Add email validation with proper regex pattern
  - Implement password confirmation validation (passwords must match)
  - Add minimum password length validation (8 characters)
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 5.1, 5.2_

- [x] 6. Integrate PasswordInput components into form

  - Replace standard password input with custom PasswordInput component
  - Add password strength meter to main password field
  - Add visibility toggle to both password and confirm password fields
  - Implement real-time validation feedback for password matching
  - _Requirements: 2.2, 2.3, 3.1, 3.3, 3.4_

- [ ] 7. Configure Nile useSignUp hook for simplified flow

  - Update useSignUp onSuccess callback to redirect to "/dashboard/settings"
  - Simplify onError callback to handle only authentication errors
  - Remove complex error handling for business logic
  - Pass only email and password to Nile signup function
  - _Requirements: 1.2, 1.3, 1.4, 6.2, 6.3_

- [x] 8. Implement form submission with password validation

  - Create onSubmit handler with password confirmation validation
  - Add password strength validation (minimum score requirement)
  - Implement proper error display for validation failures
  - Ensure form prevents submission when passwords don't match
  - _Requirements: 2.2, 2.3, 5.2, 5.3, 6.4_

- [ ] 9. Add loading states and error handling

  - Implement loading state on submit button during signup
  - Add error display using Alert component for signup failures
  - Show inline validation errors for form fields
  - Display password strength feedback in real-time
  - _Requirements: 6.1, 6.2, 6.4_

- [ ] 10. Clean up and remove unused code

  - Remove all business/company related imports and components
  - Remove PlanSelect component and related logic
  - Clean up unused state variables and handlers
  - Remove complex alert components for business logic
  - _Requirements: 1.1, 5.1_

- [x] 11. Update form UI and styling

  - Simplify card layout to show only essential signup fields
  - Update form labels and placeholders for new structure
  - Ensure consistent styling with login page
  - Maintain responsive design for mobile devices
  - _Requirements: 1.1, 4.1, 5.1_

- [ ] 12. Write tests for password functionality
  - Write unit tests for password strength calculation
  - Test password confirmation validation logic
  - Test password visibility toggle functionality
  - Test form validation with various password scenarios
  - Test SignedIn/SignedOut conditional rendering
  - _Requirements: 2.2, 3.1, 3.3, 4.1, 6.4_
