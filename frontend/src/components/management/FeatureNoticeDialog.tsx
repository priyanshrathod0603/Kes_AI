'use client'

import { Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface FeatureNoticeDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  featureName?: string
  description?: string
}

export function FeatureNoticeDialog({
  open,
  onClose,
  title = 'Operation Notice',
  featureName,
  description = 'This operation is not currently exposed by the backend API. Only supported operations are mutated directly against the database.',
}: FeatureNoticeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? null : onClose())}>
      <DialogContent className="sm:max-w-md">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-foreground-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Info className="h-5 w-5" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-foreground-muted text-sm pt-1">
            {featureName && (
              <span className="block font-medium text-foreground mb-1 text-sm">
                {featureName}
              </span>
            )}
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end pt-4">
          <Button type="button" onClick={onClose}>
            Understood
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
