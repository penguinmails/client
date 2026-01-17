/**
 * Shared Help Section Component
 * 
 * Reusable help section to prevent cross-feature dependencies
 */

"use client";

import React, { useState, useCallback } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
// import { getMockOnboardingSteps } from "@/lib/mocks/providers";

// Simple components to avoid upward dependencies
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

function SimpleCard({ className = "", children }: CardProps) {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SimpleCardHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col space-y-1.5 p-6">{children}</div>;
}

function SimpleCardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-2xl font-semibold leading-none tracking-tight">{children}</h3>;
}

function SimpleCardContent({ className = "", children }: CardProps) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

function SimpleSeparator() {
  return <div className="shrink-0 bg-border h-px w-full" />;
}

function SimpleCollapsible({ 
  open, 
  _onOpenChange, 
  children 
}: { 
  open: boolean; 
  _onOpenChange: (open: boolean) => void; 
  children: React.ReactNode;
}) {
  return <div data-state={open ? "open" : "closed"}>{children}</div>;
}

function SimpleCollapsibleTrigger({ 
  children, 
  onClick 
}: { 
  children: React.ReactNode; 
  onClick: () => void;
}) {
  return (
    <div onClick={onClick} style={{ cursor: 'pointer' }}>
      {children}
    </div>
  );
}

function SimpleCollapsibleContent({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}

// Simple button component to avoid upward dependency
interface ButtonProps {
  variant?: "ghost" | "default";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

function SimpleButton({ variant = "default", className = "", children, onClick }: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variantClasses = variant === "ghost" 
    ? "hover:bg-accent hover:text-accent-foreground" 
    : "bg-primary text-primary-foreground hover:bg-primary/90";
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface HelpItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface HelpSectionProps {
  title?: string;
  items?: HelpItem[];
  className?: string;
}

// Default help items based on onboarding steps
// Moved inside component to use translations
import { useTranslations } from "next-intl";

export function HelpSection({ 
  title, 
  items,
  className = ""
}: HelpSectionProps) {
  const t = useTranslations("Components.HelpSection");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const defaultTitle = t("title");
  
  const defaultItems: HelpItem[] = [
    {
      id: "getting-started",
      question: t("questions.gettingStarted"),
      answer: t("questions.gettingStartedAns"),
      category: "setup"
    },
    {
      id: "email-setup",
      question: t("questions.emailSetup"),
      answer: t("questions.emailSetupAns"),
      category: "setup"
    },
    {
      id: "domain-verification",
      question: t("questions.domainVerification"),
      answer: t("questions.domainVerificationAns"),
      category: "verification"
    },
    {
      id: "contact-import",
      question: t("questions.contactImport"),
      answer: t("questions.contactImportAns"),
      category: "setup"
    },
    {
      id: "troubleshooting",
      question: t("questions.troubleshooting"),
      answer: t("questions.troubleshootingAns"),
      category: "support"
    }
  ];

  const displayTitle = title || defaultTitle;
  const displayItems = items || defaultItems;

  const toggleItem = useCallback((itemId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  if (!displayItems || displayItems.length === 0) {
    return null;
  }

  return (
    <SimpleCard className={`w-full ${className}`}>
      <SimpleCardHeader>
        <SimpleCardTitle>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {displayTitle}
          </div>
        </SimpleCardTitle>
      </SimpleCardHeader>
      <SimpleCardContent className="space-y-4">
        {displayItems.map((item, index) => (
          <div key={item.id}>
            <SimpleCollapsible
              open={openItems.has(item.id)}
              _onOpenChange={() => toggleItem(item.id)}
            >
              <SimpleCollapsibleTrigger onClick={() => toggleItem(item.id)}>
                <SimpleButton
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto text-left"
                  onClick={() => toggleItem(item.id)}
                >
                  <span className="font-medium">{item.question}</span>
                  {openItems.has(item.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </SimpleButton>
              </SimpleCollapsibleTrigger>
              <SimpleCollapsibleContent>
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </SimpleCollapsibleContent>
            </SimpleCollapsible>
            {index < displayItems.length - 1 && <SimpleSeparator />}
          </div>
        ))}
      </SimpleCardContent>
    </SimpleCard>
  );
}

export default HelpSection;
