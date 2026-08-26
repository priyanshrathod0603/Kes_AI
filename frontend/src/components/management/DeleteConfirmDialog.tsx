'use client'

import { AlertTriangle, Loader2, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface DeleteConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title?: string
  itemName?: string
  description?: string
  isDeleting?: boolean
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Delete Item?',
  itemName,
  description = 'This action cannot be undone and will permanently remove this item.',
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  const handleClose = () => {
    if (!isDeleting) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? null : handleClose())}>
      <DialogContent className="sm:max-w-md">
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 rounded-md p-1 text-foreground-muted hover:text-foreground disabled:opacity-50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-error-50 text-error-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-foreground">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-foreground-muted text-sm pt-1">
            {itemName && (
              <span className="block font-medium text-foreground mb-1 text-sm">
                "{itemName}"
              </span>
            )}
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
