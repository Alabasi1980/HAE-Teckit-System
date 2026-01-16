
import React, { useRef, useState, useEffect } from 'react';
import { X, Trash2, CheckCircle, Edit3 } from 'lucide-react';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureData: string) => void;
  title?: string;
}

const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({ isOpen, onClose, onSave, title = "التوقيع الرقمي للمصادقة" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
        }
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasContent(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const getPos = (e: any) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasContent(false);
    }
  };

  const handleSave = () => {
    if (!hasContent) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg"><Edit3 size={18}/></div>
             <h3 className="text-lg font-black text-slate-900">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={20}/></button>
        </div>

        <div className="p-8">
           <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed text-center">يرجى رسم توقيعك داخل الإطار أدناه للمصادقة على حل التذكرة.</p>
           
           <div className="relative bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden touch-none h-64">
              <canvas 
                ref={canvasRef}
                width={500}
                height={256}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair"
              />
              {!hasContent && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                   <Edit3 size={48} className="text-slate-400" />
                </div>
              )}
           </div>

           <div className="flex gap-3 mt-8">
              <button 
                onClick={clear}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
              >
                <Trash2 size={18}/> مسح الرسم
              </button>
              <button 
                onClick={handleSave}
                disabled={!hasContent}
                className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-blue-600 transition-all disabled:opacity-30"
              >
                <CheckCircle size={18}/> اعتماد التوقيع والحفظ
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalSignatureModal;
