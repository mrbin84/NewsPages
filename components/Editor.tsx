"use client";

"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Underline as UnderlineIcon,
  Highlighter,
  Smile
} from 'lucide-react';
import { ImageResize } from '@/lib/extensions/image-resize';
import { useToast } from '@/components/ui/use-toast';
import { EditorView } from '@tiptap/pm/view';
import { EmojiPicker } from '@/components/EmojiPicker';

interface EditorProps {
  initialTitle?: string;
  initialContent?: string;
  onSave: (data: { title: string; content: string }) => Promise<void>;
  onCancel?: () => void;
  isSaving: boolean;
  saveButtonText?: string;
  cancelButtonText?: string;
}

export function Editor({
  initialTitle = '',
  initialContent = '',
  onSave,
  onCancel,
  isSaving,
  saveButtonText = '저장',
  cancelButtonText = '취소',
}: EditorProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(initialTitle);
  const [isDragging, setIsDragging] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

    const handleFile = useCallback((file: File, view: EditorView, coordinates?: { pos: number; inside: number } | null) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: '이미지 파일만 업로드 가능합니다.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const src = readerEvent.target?.result as string;
      const { schema } = view.state;
      const node = schema.nodes.image.create({ src });

      let transaction;
      if (coordinates) {
        transaction = view.state.tr.insert(coordinates.pos, node);
      } else {
        transaction = view.state.tr.replaceSelectionWith(node);
      }
      view.dispatch(transaction);
    };
        reader.readAsDataURL(file);
  }, [toast]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
      }),
      ImageResize,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight,
      Placeholder.configure({
        placeholder: '본문을 입력하세요...',
      }),
    ],
    content: initialContent,
    editorProps: {
      handleDOMEvents: {
        drop(view, event) {
          event.preventDefault();
          setIsDragging(false);
          const files = event.dataTransfer?.files;
          if (files && files.length > 0) {
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            Array.from(files).forEach(file => handleFile(file, view, coordinates));
            return true;
          }
          return false;
        },
        dragenter: () => { setIsDragging(true); return false; },
        dragleave: () => { setIsDragging(false); return false; },
        paste(view, event) {
          const clipboard = event.clipboardData;
          if (!clipboard) return false;

          const items = Array.from(clipboard.items);
          const imageItems = items.filter(item => item.type.startsWith('image/'));

          if (imageItems.length > 0) {
            event.preventDefault();
            const imageFiles = imageItems.map(item => item.getAsFile()).filter((file): file is File => file !== null);
            
            const readFilesAsDataUrls = (files: File[]): Promise<string[]> => {
              return Promise.all(files.map(file => {
                return new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = () => reject(reader.error);
                  reader.readAsDataURL(file);
                });
              }));
            };

            readFilesAsDataUrls(imageFiles).then(urls => {
              const { schema, tr } = view.state;
              urls.forEach(src => {
                const node = schema.nodes.image.create({ src });
                tr.insert(tr.selection.from, node);
              });
              view.dispatch(tr);
            });

            const textItem = items.find(item => item.type === 'text/plain');
            if (textItem) {
              textItem.getAsString(text => {
                const { tr } = view.state;
                tr.insertText(text);
                view.dispatch(tr);
              });
            }
            return true;
          }
          return false;
        },
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent, false);
    }
  }, [initialContent, editor]);

  const handleSaveClick = async () => {
    const content = editor?.getHTML() || '';
    if (!title.trim()) {
      toast({ title: '제목을 입력해주세요', variant: 'destructive' });
      return;
    }
    await onSave({ title, content });
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      handleFile(file, editor.view);
    }
  }, [editor, handleFile]);

  const addEmoji = useCallback((emoji: string) => {
    editor?.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      <div className="p-2 flex-shrink-0">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="text-2xl font-bold border-none focus:ring-0 shadow-none p-0"
          disabled={isSaving}
        />
      </div>
      <div 
        className={`flex-grow flex flex-col overflow-y-auto border rounded-md ${isDragging ? 'bg-gray-100' : ''}`}
        onClick={() => editor?.chain().focus().run()}
      >
        <div className="sticky top-0 z-10 bg-background border-b p-2 flex items-center gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-accent' : ''} disabled={isSaving}><Bold className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-accent' : ''} disabled={isSaving}><Italic className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'bg-accent' : ''} disabled={isSaving}><UnderlineIcon className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'bg-accent' : ''} disabled={isSaving}><Highlighter className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''} disabled={isSaving}><AlignLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''} disabled={isSaving}><AlignCenter className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''} disabled={isSaving}><AlignRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-accent' : ''} disabled={isSaving}><List className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-accent' : ''} disabled={isSaving}><ListOrdered className="h-4 w-4" /></Button>
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)} disabled={isSaving}><Smile className="h-4 w-4" /></Button>
            {showEmojiPicker && (
              <div className="absolute top-full left-0 z-50"><EmojiPicker onEmojiSelect={addEmoji} /></div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
          <Button variant="ghost" size="sm" onClick={() => document.getElementById('image-upload')?.click()} disabled={isSaving}><ImageIcon className="h-4 w-4" /></Button>
        </div>
        <EditorContent editor={editor} className="flex-grow p-4 prose max-w-none focus:outline-none" />
      </div>
      <div className="p-4 border-t flex justify-end flex-shrink-0 space-x-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            {cancelButtonText}
          </Button>
        )}
        <Button onClick={handleSaveClick} disabled={isSaving}>
          {isSaving ? '저장 중...' : saveButtonText}
        </Button>
      </div>
    </div>
  );
}