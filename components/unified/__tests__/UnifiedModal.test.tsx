import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  UnifiedModal,
  UnifiedModalContent,
  UnifiedModalHeader,
  UnifiedModalTitle,
  UnifiedModalDescription,
  UnifiedModalBody,
  UnifiedModalFooter,
  UnifiedModalTrigger,
  UnifiedModalClose,
} from '../UnifiedModal';
import { Button } from '@/components/ui/button/button';

describe('UnifiedModal', () => {
  it('renders modal with all components', () => {
    render(
      <UnifiedModal open>
        <UnifiedModalContent>
          <UnifiedModalHeader>
            <UnifiedModalTitle>Test Modal</UnifiedModalTitle>
            <UnifiedModalDescription>This is a test modal</UnifiedModalDescription>
          </UnifiedModalHeader>
          <UnifiedModalBody>
            <p>Modal content goes here</p>
          </UnifiedModalBody>
          <UnifiedModalFooter>
            <Button>Action</Button>
          </UnifiedModalFooter>
        </UnifiedModalContent>
      </UnifiedModal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('This is a test modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content goes here')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(
      <UnifiedModal open>
        <UnifiedModalContent size="sm" data-testid="modal-content">
          <UnifiedModalTitle>Small Modal</UnifiedModalTitle>
        </UnifiedModalContent>
      </UnifiedModal>
    );

    const modalContent = screen.getByTestId('modal-content');
    expect(modalContent).toHaveClass('max-w-sm');

    rerender(
      <UnifiedModal open>
        <UnifiedModalContent size="lg" data-testid="modal-content">
          <UnifiedModalTitle>Large Modal</UnifiedModalTitle>
        </UnifiedModalContent>
      </UnifiedModal>
    );

    expect(modalContent).toHaveClass('max-w-2xl');
  });

  it('renders bordered header variant', () => {
    render(
      <UnifiedModal open>
        <UnifiedModalContent>
          <UnifiedModalHeader bordered data-testid="modal-header">
            <UnifiedModalTitle>Bordered Header</UnifiedModalTitle>
          </UnifiedModalHeader>
        </UnifiedModalContent>
      </UnifiedModal>
    );

    const header = screen.getByTestId('modal-header');
    expect(header).toHaveClass('border-b', 'pb-4', 'mb-4');
  });

  it('renders bordered footer variant', () => {
    render(
      <UnifiedModal open>
        <UnifiedModalContent>
          <UnifiedModalFooter bordered data-testid="modal-footer">
            <Button>Action</Button>
          </UnifiedModalFooter>
        </UnifiedModalContent>
      </UnifiedModal>
    );

    const footer = screen.getByTestId('modal-footer');
    expect(footer).toHaveClass('border-t', 'pt-4', 'mt-4');
  });

  it('can hide close button', () => {
    render(
      <UnifiedModal open>
        <UnifiedModalContent showClose={false}>
          <UnifiedModalTitle>No Close Button</UnifiedModalTitle>
        </UnifiedModalContent>
      </UnifiedModal>
    );

    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('shows close button by default', () => {
    render(
      <UnifiedModal open>
        <UnifiedModalContent>
          <UnifiedModalTitle>With Close Button</UnifiedModalTitle>
        </UnifiedModalContent>
      </UnifiedModal>
    );

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('handles trigger and close interactions', () => {
    const onOpenChange = jest.fn();

    render(
      <UnifiedModal onOpenChange={onOpenChange}>
        <UnifiedModalTrigger asChild>
          <Button>Open Modal</Button>
        </UnifiedModalTrigger>
        <UnifiedModalContent>
          <UnifiedModalTitle>Test Modal</UnifiedModalTitle>
          <UnifiedModalClose asChild>
            <Button>Close</Button>
          </UnifiedModalClose>
        </UnifiedModalContent>
      </UnifiedModal>
    );

    const trigger = screen.getByText('Open Modal');
    fireEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('applies custom className correctly', () => {
    render(
      <UnifiedModal open>
        <UnifiedModalContent className="custom-modal" data-testid="modal-content">
          <UnifiedModalTitle>Custom Modal</UnifiedModalTitle>
        </UnifiedModalContent>
      </UnifiedModal>
    );

    const modalContent = screen.getByTestId('modal-content');
    expect(modalContent).toHaveClass('custom-modal');
  });

  it('renders full size modal correctly', () => {
    render(
      <UnifiedModal open>
        <UnifiedModalContent size="full" data-testid="modal-content">
          <UnifiedModalTitle>Full Size Modal</UnifiedModalTitle>
          <UnifiedModalDescription>Full size modal description</UnifiedModalDescription>
        </UnifiedModalContent>
      </UnifiedModal>
    );

    const modalContent = screen.getByTestId('modal-content');
    expect(modalContent).toHaveClass('w-[95vw]', 'h-[95vh]');
  });

  it('renders xl size modal correctly', () => {
    render(
      <UnifiedModal open>
        <UnifiedModalContent size="xl" data-testid="modal-content">
          <UnifiedModalTitle>XL Modal</UnifiedModalTitle>
          <UnifiedModalDescription>XL modal description</UnifiedModalDescription>
        </UnifiedModalContent>
      </UnifiedModal>
    );

    const modalContent = screen.getByTestId('modal-content');
    expect(modalContent).toHaveClass('max-w-4xl');
  });
});