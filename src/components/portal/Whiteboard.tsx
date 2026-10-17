import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  Trash,
  Download,
  Palette
} from '@phosphor-icons/react';

type Tool = 'pen' | 'highlighter' | 'eraser';

const PALETTE = [
  { hex: '#DC2626', label: 'Qalqalah / Mistake Red' },
  { hex: '#059669', label: 'Ghunnah Green' },
  { hex: '#0284C7', label: 'Idgham Azure' },
  { hex: '#9333EA', label: 'Madd Purple' },
  { hex: '#D4A72C', label: 'Noor-e-Quran Gold' },
  { hex: '#111827', label: 'Ink Black' }
];

// Shared whiteboard for 1-on-1 Quran teaching: write Arabic letters,
// circle Makharij mistakes, highlight Tajweed rules. Local canvas;
// realtime sync between teacher & student is a planned follow-up.
export const Whiteboard: React.FC<{ title?: string; subtitle?: string }> = ({
  title = 'Teaching Whiteboard',
  subtitle = 'Write Arabic letters, circle mistakes, highlight Tajweed rules live during class.'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#DC2626');
  const [brushSize, setBrushSize] = useState(3);

  // Size canvas to its container on mount / resize.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = Math.max(320, Math.min(480, window.innerHeight * 0.45));
      // Preserve existing drawing across resizes.
      const prev = document.createElement('canvas');
      prev.width = canvas.width; prev.height = canvas.height;
      const pctx = prev.getContext('2d');
      if (pctx && canvas.width > 0) pctx.drawImage(canvas, 0, 0);
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (prev.width > 0) ctx.drawImage(prev, 0, 0);
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const pos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    const me = e as React.MouseEvent;
    return { x: me.clientX - rect.left, y: me.clientY - rect.top };
  };

  const applyStyle = (ctx: CanvasRenderingContext2D) => {
    if (tool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = brushSize * 5;
      (ctx as any).globalAlpha = 1;
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = color;
      (ctx as any).globalAlpha = 0.35;
      ctx.lineWidth = brushSize * 4;
    } else {
      ctx.strokeStyle = color;
      (ctx as any).globalAlpha = 1;
      ctx.lineWidth = brushSize;
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { x, y } = pos(e);
    applyStyle(ctx);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    if ('touches' in e) e.preventDefault();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { x, y } = pos(e);
    applyStyle(ctx);
    ctx.lineTo(x, y);
    ctx.stroke();
    if ('touches' in e) e.preventDefault();
  };

  const stopDrawing = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.closePath();
      (ctx as any).globalAlpha = 1;
    }
    setIsDrawing(false);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `noor-whiteboard-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const toolBtn = (id: Tool, label: string, Icon: any) => (
    <button
      key={id}
      onClick={() => setTool(id)}
      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
        tool === id ? 'bg-[#064E3B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      title={label}
    >
      <Icon className="w-3.5 h-3.5" weight="duotone" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-[#064E3B] flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
            {title}
          </h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadPng}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1.5 cursor-pointer"
            title="Download whiteboard as PNG"
          >
            <Download className="w-3.5 h-3.5" weight="duotone" />
            <span className="hidden sm:inline">Save PNG</span>
          </button>
          <button
            onClick={clearCanvas}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer"
            title="Clear whiteboard"
          >
            <Trash className="w-3.5 h-3.5" weight="duotone" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2.5">
        {toolBtn('pen', 'Pen', Pen)}
        {toolBtn('highlighter', 'Highlighter', Highlighter)}
        {toolBtn('eraser', 'Eraser', Eraser)}
        <div className="h-6 w-px bg-gray-300 mx-1" />
        <div className="flex items-center gap-1.5">
          {PALETTE.map(c => (
            <button
              key={c.hex}
              onClick={() => { setColor(c.hex); setTool('pen'); }}
              style={{ backgroundColor: c.hex }}
              className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                color === c.hex && tool !== 'eraser'
                  ? 'scale-125 border-gray-900 ring-2 ring-gray-300'
                  : 'border-white shadow-xs'
              }`}
              title={c.label}
            />
          ))}
        </div>
        <div className="h-6 w-px bg-gray-300 mx-1" />
        <label className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
          Size
          <input
            type="range"
            min={1}
            max={10}
            value={brushSize}
            onChange={e => setBrushSize(Number(e.target.value))}
            className="w-20 sm:w-28 accent-[#064E3B] cursor-pointer"
          />
        </label>
      </div>

      {/* Canvas */}
      <div className="relative rounded-2xl border-2 border-dashed border-gray-300 bg-white overflow-hidden select-none touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full block cursor-crosshair touch-none"
          style={{ minHeight: 320 }}
        />
      </div>
      <p className="text-[11px] text-gray-400">
        Tip: pick <strong className="text-rose-600">red</strong> to circle recitation mistakes,
        <strong className="text-emerald-600"> green</strong> for correct Makharij, gold for Tajweed rules.
      </p>
    </div>
  );
};
