import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import Image from '@tiptap/extension-image'
import { ImageResizeComponent } from '@/components/ImageResizeComponent'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { NodeSelection, Selection } from 'prosemirror-state'

export interface ImageResizeOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageResize: {
      setImageSize: (options: { width?: number; height?: number }) => ReturnType
    }
  }
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export const ImageResize = Image.extend<ImageResizeOptions>({
  name: 'imageResize',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: attributes.width,
          }
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) {
            return {}
          }
          return {
            height: attributes.height,
          }
        },
      },
    }
  },

  addCommands() {
    return {
      setImageSize: options => ({ commands }) => {
        return commands.updateAttributes('imageResize', options)
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeComponent)
  },

  addProseMirrorPlugins() {
    let isResizing = false
    let startX = 0
    let startY = 0
    let startWidth = 0
    let startHeight = 0
    let resizingImage: HTMLElement | null = null
    let resizeDirection: ResizeDirection | '' = ''

    const createHandle = (position: ResizeDirection, imageWidth: number, imageHeight: number) => {
      const handle = document.createElement('div')
      handle.className = `image-resize-handle ${position}`
      handle.style.cssText = `
        position: absolute;
        width: 12px;
        height: 12px;
        background: #4a9eff;
        border: 2px solid white;
        border-radius: 50%;
        cursor: ${position}-resize;
        z-index: 100;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        pointer-events: auto;
      `

      // Position the handle based on image dimensions
      switch (position) {
        case 'n':
          handle.style.top = '-6px'
          handle.style.left = '50%'
          handle.style.transform = 'translateX(-50%)'
          break
        case 's':
          handle.style.bottom = '-6px'
          handle.style.left = '50%'
          handle.style.transform = 'translateX(-50%)'
          break
        case 'e':
          handle.style.top = '50%'
          handle.style.right = '-6px'
          handle.style.transform = 'translateY(-50%)'
          break
        case 'w':
          handle.style.top = '50%'
          handle.style.left = '-6px'
          handle.style.transform = 'translateY(-50%)'
          break
        case 'ne':
          handle.style.top = '-6px'
          handle.style.right = '-6px'
          break
        case 'nw':
          handle.style.top = '-6px'
          handle.style.left = '-6px'
          break
        case 'se':
          handle.style.bottom = '-6px'
          handle.style.right = '-6px'
          break
        case 'sw':
          handle.style.bottom = '-6px'
          handle.style.left = '-6px'
          break
      }

      return handle
    }

    const resizeDirections: ResizeDirection[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

    return [
      new Plugin({
        key: new PluginKey('imageResize'),
        props: {
          decorations(state) {
            const { selection } = state
            const decorations: Decoration[] = []

            if (selection instanceof NodeSelection && selection.node && selection.node.type.name === 'image') {
              const pos = selection.from
              const node = state.doc.nodeAt(pos)
              if (!node) return DecorationSet.empty

              const attrs = node.attrs
              const imageWidth = attrs.width || 0
              const imageHeight = attrs.height || 0

              const container = document.createElement('div')
              container.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 100;
              `

              // Add all handles with current image dimensions
              resizeDirections.forEach(position => {
                container.appendChild(createHandle(position, imageWidth, imageHeight))
              })

              decorations.push(
                Decoration.widget(pos + 1, container, {
                  side: 1,
                  key: 'image-resize-handles',
                })
              )


            }

            return DecorationSet.create(state.doc, decorations)
          },
          handleDOMEvents: {
            mousedown: (view, event) => {
              const target = event.target as HTMLElement
              if (target.classList.contains('image-resize-handle')) {
                event.preventDefault()
                event.stopPropagation()
                
                isResizing = true
                startX = event.clientX
                startY = event.clientY
                const direction = target.classList[1] as ResizeDirection
                resizeDirection = direction

                const { state } = view
                const { selection } = state
                if (selection instanceof NodeSelection && selection.node && selection.node.type.name === 'image') {
                  const dom = view.nodeDOM(selection.from) as HTMLElement
                  if (dom) {
                    resizingImage = dom
                    startWidth = dom.offsetWidth
                    startHeight = dom.offsetHeight
                  }
                }
                return true
              }
              return false
            },
            mousemove: (view, event) => {
              if (!isResizing || !resizingImage) return false

              event.preventDefault()
              event.stopPropagation()

              const deltaX = event.clientX - startX
              const deltaY = event.clientY - startY
              let newWidth = startWidth
              let newHeight = startHeight

              // Adjust width and height based on resize direction
              if (resizeDirection.includes('e')) newWidth = Math.max(100, startWidth + deltaX)
              if (resizeDirection.includes('w')) newWidth = Math.max(100, startWidth - deltaX)
              if (resizeDirection.includes('s')) newHeight = Math.max(100, startHeight + deltaY)
              if (resizeDirection.includes('n')) newHeight = Math.max(100, startHeight - deltaY)

              resizingImage.style.width = `${newWidth}px`
              resizingImage.style.height = `${newHeight}px`

              // Update image node attributes
              const { state } = view
              const { selection } = state
              if (selection instanceof NodeSelection && selection.node && selection.node.type.name === 'image') {
                const tr = state.tr.setNodeMarkup(selection.from, undefined, {
                  ...selection.node.attrs,
                  width: newWidth,
                  height: newHeight,
                })
                view.dispatch(tr)
              }

              return true
            },
            mouseup: (view, event) => {
              if (isResizing && resizingImage) {
                event.preventDefault()
                event.stopPropagation()
                
                isResizing = false
                resizingImage = null
                resizeDirection = ''
                return true
              }
              return false
            },
          },
        },
      }),
    ]
  },
}) 