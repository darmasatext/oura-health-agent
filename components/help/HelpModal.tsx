'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface HelpModalProps {
  title: string;
  children: React.ReactNode;
  triggerText?: string;
}

export function HelpModal({ title, children, triggerText = "Más información" }: HelpModalProps) {
  return (
    <Dialog>
      <DialogTrigger 
        render={
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 min-h-[44px] min-w-[44px] touch-manipulation"
            aria-label={`Ver ${title}`}
          />
        }
      >
        <HelpCircle className="w-4 h-4" />
        {triggerText}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="prose prose-sm max-w-none prose-headings:font-bold prose-h2:text-lg prose-h3:text-base prose-p:text-gray-700 prose-ul:text-gray-700 prose-strong:text-gray-900">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
