import { describe, it, expect, beforeEach } from 'vitest'
import { useBuilderStore } from '../src/store/builderStore'

describe('Copy/Duplicate Functionality', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useBuilderStore.getState()
    store.loadProject({ components: [] })
    // Clear copied component
    useBuilderStore.setState({ copiedComponent: null, selectedComponent: null })
  })

  it('should duplicate a component with unique id and offset position', () => {
    const store = useBuilderStore.getState()
    
    const originalComponent = {
      id: 'test-1',
      type: 'text',
      label: 'Text',
      position: { x: 100, y: 100 },
      props: { content: 'Test Component' },
      style: { fontSize: '16px', color: '#374151' }
    }

    // Add the original component
    store.addComponent(originalComponent)
    expect(useBuilderStore.getState().components).toHaveLength(1)

    // Duplicate the component
    store.duplicateComponent('test-1')
    const currentState = useBuilderStore.getState()
    expect(currentState.components).toHaveLength(2)

    const duplicatedComponent = currentState.components[1]
    expect(duplicatedComponent.id).not.toBe(originalComponent.id)
    expect(duplicatedComponent.type).toBe(originalComponent.type)
    expect(duplicatedComponent.props.content).toBe(originalComponent.props.content)
    expect(duplicatedComponent.position.x).toBe(originalComponent.position.x + 20)
    expect(duplicatedComponent.position.y).toBe(originalComponent.position.y + 20)
    expect(currentState.selectedComponent).toBe(duplicatedComponent)
  })

  it('should copy and paste a component', () => {
    const store = useBuilderStore.getState()
    
    const originalComponent = {
      id: 'test-1',
      type: 'button',
      label: 'Button',
      position: { x: 50, y: 50 },
      props: { text: 'Click Me' },
      style: { backgroundColor: '#8B5CF6' }
    }

    // Add the original component
    store.addComponent(originalComponent)
    expect(useBuilderStore.getState().components).toHaveLength(1)

    // Copy the component
    store.copyComponent('test-1')
    let currentState = useBuilderStore.getState()
    expect(currentState.copiedComponent).toBeTruthy()
    expect(currentState.copiedComponent.type).toBe(originalComponent.type)

    // Paste the component
    store.pasteComponent()
    currentState = useBuilderStore.getState()
    expect(currentState.components).toHaveLength(2)

    const pastedComponent = currentState.components[1]
    expect(pastedComponent.id).not.toBe(originalComponent.id)
    expect(pastedComponent.type).toBe(originalComponent.type)
    expect(pastedComponent.props.text).toBe(originalComponent.props.text)
    expect(pastedComponent.position.x).toBe(originalComponent.position.x + 40)
    expect(pastedComponent.position.y).toBe(originalComponent.position.y + 40)
    expect(currentState.selectedComponent).toBe(pastedComponent)
  })

  it('should not duplicate non-existent component', () => {
    const store = useBuilderStore.getState()
    const initialLength = store.components.length
    store.duplicateComponent('non-existent-id')
    expect(useBuilderStore.getState().components).toHaveLength(initialLength)
  })

  it('should not copy non-existent component', () => {
    const store = useBuilderStore.getState()
    store.copyComponent('non-existent-id')
    expect(useBuilderStore.getState().copiedComponent).toBeNull()
  })

  it('should not paste when no component is copied', () => {
    const store = useBuilderStore.getState()
    const initialLength = store.components.length
    store.pasteComponent()
    expect(useBuilderStore.getState().components).toHaveLength(initialLength)
  })
})