'use client';

import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Maximize2, Minimize2 } from 'lucide-react';

export const ImageResizeComponent = ({ node, updateAttributes, selected }: NodeViewProps) => {
  const [isResizeDialogOpen, setIsResizeDialogOpen] = useState(false);
  const [width, setWidth] = useState(node.attrs.width || '');
  const [height, setHeight] = useState(node.attrs.height || '');
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      if (!img.complete) {
        img.onload = () => {
          setAspectRatio(img.naturalWidth / img.naturalHeight);
        };
      } else {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    }
  }, [node.attrs.src]);

  const handleWidthChange = (value: string) => {
    setWidth(value);
    if (aspectRatio && value) {
      setHeight(Math.round(Number(value) / aspectRatio).toString());
    }
  };

  const handleHeightChange = (value: string) => {
    setHeight(value);
    if (aspectRatio && value) {
      setWidth(Math.round(Number(value) * aspectRatio).toString());
    }
  };

  const handleResize = () => {
    updateAttributes({
      width: width ? Number(width) : null,
      height: height ? Number(height) : null,
    });
    setIsResizeDialogOpen(false);
  };

  const handleReset = () => {
    if (imageRef.current) {
      const img = imageRef.current;
      updateAttributes({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setWidth(img.naturalWidth.toString());
      setHeight(img.naturalHeight.toString());
    }
  };

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    setIsResizing(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setStartWidth(imageRef.current?.offsetWidth || 0);
    setStartHeight(imageRef.current?.offsetHeight || 0);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      switch (handle) {
        case 'e':
          newWidth = startWidth + deltaX;
          newHeight = newWidth / (aspectRatio || 1);
          break;
        case 's':
          newHeight = startHeight + deltaY;
          newWidth = newHeight * (aspectRatio || 1);
          break;
        case 'se':
          newWidth = startWidth + deltaX;
          newHeight = newWidth / (aspectRatio || 1);
          break;
      }

      setWidth(Math.round(newWidth).toString());
      setHeight(Math.round(newHeight).toString());
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      updateAttributes({
        width: Number(width),
        height: Number(height),
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <NodeViewWrapper className="image-resize-wrapper">
      <div
        ref={containerRef}
        className="relative inline-block"
        style={{
          outline: selected ? '2px solid #3b82f6' : 'none',
        }}
      >
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt}
          width={node.attrs.width}
          height={node.attrs.height}
          className="max-w-full"
          style={{ display: 'block' }}
        />
        {selected && (
          <>
            <div className="absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center">
              <Dialog open={isResizeDialogOpen} onOpenChange={setIsResizeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="absolute top-2 right-2">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>이미지 크기 조절</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="width">너비 (px)</Label>
                        <Input
                          id="width"
                          type="number"
                          value={width}
                          onChange={(e) => handleWidthChange(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">높이 (px)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={height}
                          onChange={(e) => handleHeightChange(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handleReset}>
                        <Minimize2 className="h-4 w-4 mr-2" />
                        원본 크기
                      </Button>
                      <div className="space-x-2">
                        <Button variant="outline" onClick={() => setIsResizeDialogOpen(false)}>
                          취소
                        </Button>
                        <Button onClick={handleResize}>적용</Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {/* Resize Handles */}
            <div
              className="absolute right-0 top-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-e-resize transform -translate-y-1/2 translate-x-1/2"
              onMouseDown={(e) => handleMouseDown(e, 'e')}
            />
            <div
              className="absolute bottom-0 left-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-s-resize transform -translate-x-1/2 translate-y-1/2"
              onMouseDown={(e) => handleMouseDown(e, 's')}
            />
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-se-resize transform translate-x-1/2 translate-y-1/2"
              onMouseDown={(e) => handleMouseDown(e, 'se')}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}; 