import { useEffect } from 'react'
import { useBuilderStore } from '../store/builderStore'

export const useKeyboardShortcuts = () => {
  const { 
    selectedComponent, 
    copyComponent, 
    pasteComponent, 
    duplicateComponent,
    deleteComponent,
    undo,
    redo,
    copiedComponent
  } = useBuilderStore()

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return
      }

      const { ctrlKey, metaKey, key } = event
      const isModifierPressed = ctrlKey || metaKey

      if (isModifierPressed) {
        switch (key.toLowerCase()) {
          case 'c':
            if (selectedComponent) {
              event.preventDefault()
              copyComponent(selectedComponent.id)
            }
            break
          
          case 'v':
            if (copiedComponent) {
              event.preventDefault()
              pasteComponent()
            }
            break
          
          case 'd':
            if (selectedComponent) {
              event.preventDefault()
              duplicateComponent(selectedComponent.id)
            }
            break
          
          case 'z':
            if (event.shiftKey) {
              event.preventDefault()
              redo()
            } else {
              event.preventDefault()
              undo()
            }
            break
          
          case 'y':
            event.preventDefault()
            redo()
            break
        }
      } else if (key === 'Delete' || key === 'Backspace') {
        if (selectedComponent) {
          event.preventDefault()
          deleteComponent(selectedComponent.id)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedComponent, copyComponent, pasteComponent, duplicateComponent, deleteComponent, undo, redo, copiedComponent])
}