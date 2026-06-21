import { ArrowLeftIcon } from '@heroicons/react/16/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button, Modal, Separator } from '@heroui/react';

export function PageHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="flex items-center gap-3 border-b px-6 py-4">
      <Modal>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-1.5 gap-1.5 text-muted-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </Button>

        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-sm">
              <Modal.CloseTrigger />
              <Modal.Header>
                <div className="flex gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <ExclamationTriangleIcon className="size-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Modal.Heading className="text-sm font-semibold">
                      Leave this page?
                    </Modal.Heading>
                    <p className="text-sm text-muted-foreground">
                      Your benchmark hasn&apos;t been saved yet. Going back will
                      discard everything you&apos;ve entered.
                    </p>
                  </div>
                </div>
              </Modal.Header>

              <Modal.Footer>
                <Button variant="ghost" slot="close">
                  Stay on page
                </Button>
                <Button variant="danger" onPress={onBack}>
                  Discard &amp; go back
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Separator orientation="vertical" className="h-4" />
      <div>
        <h1 className="text-sm font-semibold">Add Benchmark</h1>
        <p className="text-xs text-muted-foreground">Admin only</p>
      </div>
    </header>
  );
}
