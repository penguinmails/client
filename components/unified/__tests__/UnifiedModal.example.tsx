import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label';

/**
 * Example usage of UnifiedModal component with different variants and sizes
 */
export function UnifiedModalExamples() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">UnifiedModal Examples</h2>

      {/* Basic Modal with Trigger */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Basic Modal</h3>
        <UnifiedModal>
          <UnifiedModalTrigger asChild>
            <Button>Open Basic Modal</Button>
          </UnifiedModalTrigger>
          <UnifiedModalContent>
            <UnifiedModalHeader>
              <UnifiedModalTitle>Basic Modal</UnifiedModalTitle>
              <UnifiedModalDescription>
                This is a basic modal with default styling and size.
              </UnifiedModalDescription>
            </UnifiedModalHeader>
            <UnifiedModalBody>
              <p>This is the modal content area. You can put any content here.</p>
            </UnifiedModalBody>
            <UnifiedModalFooter>
              <UnifiedModalClose asChild>
                <Button variant="outline">Cancel</Button>
              </UnifiedModalClose>
              <Button>Confirm</Button>
            </UnifiedModalFooter>
          </UnifiedModalContent>
        </UnifiedModal>
      </div>

      {/* Small Modal */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Small Modal</h3>
        <UnifiedModal>
          <UnifiedModalTrigger asChild>
            <Button variant="outline">Open Small Modal</Button>
          </UnifiedModalTrigger>
          <UnifiedModalContent size="sm">
            <UnifiedModalHeader>
              <UnifiedModalTitle>Small Modal</UnifiedModalTitle>
              <UnifiedModalDescription>
                This is a smaller modal for simple confirmations.
              </UnifiedModalDescription>
            </UnifiedModalHeader>
            <UnifiedModalFooter>
              <UnifiedModalClose asChild>
                <Button variant="outline" size="sm">Cancel</Button>
              </UnifiedModalClose>
              <Button size="sm">OK</Button>
            </UnifiedModalFooter>
          </UnifiedModalContent>
        </UnifiedModal>
      </div>

      {/* Large Modal with Form */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Large Modal with Form</h3>
        <UnifiedModal open={isFormOpen} onOpenChange={setIsFormOpen}>
          <UnifiedModalTrigger asChild>
            <Button variant="secondary">Open Form Modal</Button>
          </UnifiedModalTrigger>
          <UnifiedModalContent size="lg">
            <UnifiedModalHeader bordered>
              <UnifiedModalTitle>Create New Item</UnifiedModalTitle>
              <UnifiedModalDescription>
                Fill out the form below to create a new item.
              </UnifiedModalDescription>
            </UnifiedModalHeader>
            <UnifiedModalBody>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Enter description" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter email" />
                </div>
              </div>
            </UnifiedModalBody>
            <UnifiedModalFooter bordered>
              <UnifiedModalClose asChild>
                <Button variant="outline">Cancel</Button>
              </UnifiedModalClose>
              <Button onClick={() => setIsFormOpen(false)}>Create Item</Button>
            </UnifiedModalFooter>
          </UnifiedModalContent>
        </UnifiedModal>
      </div>

      {/* XL Modal */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Extra Large Modal</h3>
        <UnifiedModal>
          <UnifiedModalTrigger asChild>
            <Button variant="secondary">Open XL Modal</Button>
          </UnifiedModalTrigger>
          <UnifiedModalContent size="xl">
            <UnifiedModalHeader>
              <UnifiedModalTitle>Extra Large Modal</UnifiedModalTitle>
              <UnifiedModalDescription>
                This modal is extra large for displaying complex content.
              </UnifiedModalDescription>
            </UnifiedModalHeader>
            <UnifiedModalBody>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Left Column</h4>
                  <p>This is content in the left column of the extra large modal.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Right Column</h4>
                  <p>This is content in the right column of the extra large modal.</p>
                </div>
              </div>
            </UnifiedModalBody>
            <UnifiedModalFooter>
              <UnifiedModalClose asChild>
                <Button variant="outline">Close</Button>
              </UnifiedModalClose>
            </UnifiedModalFooter>
          </UnifiedModalContent>
        </UnifiedModal>
      </div>

      {/* Full Screen Modal */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Full Screen Modal</h3>
        <UnifiedModal>
          <UnifiedModalTrigger asChild>
            <Button variant="destructive">Open Full Screen</Button>
          </UnifiedModalTrigger>
          <UnifiedModalContent size="full">
            <UnifiedModalHeader bordered>
              <UnifiedModalTitle>Full Screen Modal</UnifiedModalTitle>
              <UnifiedModalDescription>
                This modal takes up most of the screen for complex workflows.
              </UnifiedModalDescription>
            </UnifiedModalHeader>
            <UnifiedModalBody>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">
                  Large content area for complex interfaces
                </p>
              </div>
            </UnifiedModalBody>
            <UnifiedModalFooter bordered>
              <UnifiedModalClose asChild>
                <Button variant="outline">Cancel</Button>
              </UnifiedModalClose>
              <Button>Save Changes</Button>
            </UnifiedModalFooter>
          </UnifiedModalContent>
        </UnifiedModal>
      </div>

      {/* Confirmation Modal (Controlled) */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Confirmation Modal (Controlled)</h3>
        <Button 
          variant="destructive" 
          onClick={() => setIsConfirmOpen(true)}
        >
          Delete Item
        </Button>
        <UnifiedModal open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <UnifiedModalContent size="sm" showClose={false}>
            <UnifiedModalHeader>
              <UnifiedModalTitle>Confirm Deletion</UnifiedModalTitle>
              <UnifiedModalDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </UnifiedModalDescription>
            </UnifiedModalHeader>
            <UnifiedModalFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => setIsConfirmOpen(false)}
              >
                Delete
              </Button>
            </UnifiedModalFooter>
          </UnifiedModalContent>
        </UnifiedModal>
      </div>

      {/* Modal without Close Button */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Modal without Close Button</h3>
        <UnifiedModal>
          <UnifiedModalTrigger asChild>
            <Button variant="outline">Open No-Close Modal</Button>
          </UnifiedModalTrigger>
          <UnifiedModalContent showClose={false}>
            <UnifiedModalHeader>
              <UnifiedModalTitle>No Close Button</UnifiedModalTitle>
              <UnifiedModalDescription>
                This modal doesn&apos;t have a close button in the top-right corner.
              </UnifiedModalDescription>
            </UnifiedModalHeader>
            <UnifiedModalBody>
              <p>You must use the footer buttons to close this modal.</p>
            </UnifiedModalBody>
            <UnifiedModalFooter>
              <UnifiedModalClose asChild>
                <Button>Close Modal</Button>
              </UnifiedModalClose>
            </UnifiedModalFooter>
          </UnifiedModalContent>
        </UnifiedModal>
      </div>
    </div>
  );
}

export default UnifiedModalExamples;