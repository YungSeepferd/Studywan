import * as Popover from '@radix-ui/react-popover'
import { useFloating, offset, flip, shift, Placement } from '@floating-ui/react'
import { AnimatePresence, motion } from 'motion/react'
import React, { cloneElement, isValidElement } from 'react'

type Props = {
  open: boolean
  onOpenChange: (o: boolean) => void
  trigger: React.ReactNode
  children: React.ReactNode
  placement?: Placement
}

export function PopoverFloating({ open, onOpenChange, trigger, children, placement = 'bottom-start' }: Props) {
  const { refs, floatingStyles } = useFloating({ placement, middleware: [offset(8), flip(), shift()] })
  const triggerNode = isValidElement(trigger)
    ? cloneElement(trigger as any, {
        ref: (node: any) => {
          try { refs.setReference(node) } catch {}
        },
      })
    : trigger
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        {/* The trigger should be focusable and handle keyboard */}
        {triggerNode}
      </Popover.Trigger>
      <AnimatePresence>
        {open && (
          <Popover.Content asChild forceMount>
            <motion.div
              ref={refs.setFloating as any}
              style={floatingStyles as any}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
            >
              <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                {children}
              </div>
            </motion.div>
          </Popover.Content>
        )}
      </AnimatePresence>
    </Popover.Root>
  )
}
