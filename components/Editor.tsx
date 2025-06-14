"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Underline as UnderlineIcon,
  Highlighter,
  CheckSquare,
  X,
  Upload
} from 'lucide-react';
import { ImageResize } from '@/lib/extensions/image-resize';
import { ImageResizeComponent } from '@/components/ImageResizeComponent';
import { NodeSelection } from 'prosemirror-state';
import { useToast } from '@/components/ui/use-toast';
import { ClipboardEvent } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Smile } from 'lucide-react';
import { EmojiPicker } from '@/components/EmojiPicker';
import { useRouter } from 'next/navigation';

interface EditorProps {
  onSaveSuccess: () => void;
}

export function Editor({ onSaveSuccess }: EditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFile = (file: File, view: any, coordinates?: { pos: number; inside: number } | null) => {
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
  };

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
        dragenter(view, event) {
          setIsDragging(true);
          return false;
        },
        dragleave(view, event) {
          setIsDragging(false);
          return false;
        },
        paste(view, event) {
          const clipboard = event.clipboardData;
          if (!clipboard) return false;

          const imageFiles = Array.from(clipboard.files).filter(file =>
            file.type.startsWith('image/')
          );

          if (imageFiles.length > 0) {
            event.preventDefault();

            const text = clipboard.getData('text/plain');
            const { schema } = view.state;

            const readFilesAsDataUrls = (files: File[]): Promise<string[]> => {
              return Promise.all(
                files.map(file => {
                  return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(reader.error);
                    reader.readAsDataURL(file);
                  });
                })
              );
            };

            readFilesAsDataUrls(imageFiles).then(sources => {
              let tr = view.state.tr;
              if (!tr.selection.empty) {
                tr = tr.deleteSelection();
              }

              if (text) {
                tr.insertText(text);
              }

              sources.forEach(src => {
                const node = schema.nodes.image.create({ src });
                tr.insert(tr.selection.to, node);
              });

              view.dispatch(tr);
            });

            return true;
          }

          return false;
        },
      },
    },
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: '제목을 입력해주세요.', variant: 'destructive' });
      return;
    }
    if (!content.trim() || content === '<p></p>') {
      toast({ title: '내용을 입력해주세요.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '기사 저장에 실패했습니다.');
      }

      toast({
        title: '기사 저장됨',
        description: '기사가 성공적으로 저장되었습니다.',
      });
      router.refresh();
      onSaveSuccess();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '기사 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    handleFile(file, editor.view);
  }, [editor]);

  const addEmoji = useCallback((emoji: string) => {
    editor?.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="p-2 flex-shrink-0">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="text-2xl font-bold border-none focus:ring-0 shadow-none p-0"
        />
      </div>
      <div 
        className={`flex-grow flex flex-col overflow-y-auto border rounded-md ${isDragging ? 'bg-gray-100' : ''}`}
        onClick={() => editor?.chain().focus().run()}
      >
        <div className="sticky top-0 z-10 bg-background border-b p-2 flex items-center gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-accent' : ''}><Bold className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-accent' : ''}><Italic className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'bg-accent' : ''}><UnderlineIcon className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'bg-accent' : ''}><Highlighter className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}><AlignLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}><AlignCenter className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}><AlignRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-accent' : ''}><List className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-accent' : ''}><ListOrdered className="h-4 w-4" /></Button>
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)}><Smile className="h-4 w-4" /></Button>
            {showEmojiPicker && (
              <div className="absolute top-full left-0 z-50"><EmojiPicker onEmojiSelect={addEmoji} /></div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
          <Button variant="ghost" size="sm" onClick={() => document.getElementById('image-upload')?.click()}><ImageIcon className="h-4 w-4" /></Button>
        </div>
        <EditorContent editor={editor} className="flex-grow p-4 prose max-w-none focus:outline-none" />
      </div>
      <div className="p-4 border-t flex justify-end flex-shrink-0">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? '저장 중...' : '기사 저장'}
        </Button>
      </div>
    </div>
  );
}