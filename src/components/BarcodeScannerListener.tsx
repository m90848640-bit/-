import React, { useState, useEffect, useRef } from 'react';
import { Barcode, Scan, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { Member } from '../types';

interface BarcodeScannerListenerProps {
  onScanSuccess: (barcode: string) => void;
  members: Member[];
}

export default function BarcodeScannerListener({ onScanSuccess, members }: BarcodeScannerListenerProps) {
  const [buffer, setBuffer] = useState('');
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [matchedMember, setMatchedMember] = useState<Member | null>(null);
  const [showSimPanel, setShowSimPanel] = useState(true);
  const [typedScan, setTypedScan] = useState('');
  const lastKeyTime = useRef<number>(Date.now());

  // Physical Barcode Scanner Wedge Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keys when typing in standard text inputs/textareas to avoid stealing inputs
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      )) {
        // However, if the input is explicitly marked for scanning, we can allow it
        if (activeEl.id !== 'global-scan-input') {
          return;
        }
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime.current;
      lastKeyTime.current = currentTime;

      // Real barcode scanners type extremely fast (< 40ms per character)
      // We will accumulate alphanumeric characters
      if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
        if (timeDiff > 150) {
          // Clear buffer if it has been too long, starting a new scan
          setBuffer(e.key);
        } else {
          setBuffer((prev) => prev + e.key);
        }
      } else if (e.key === 'Enter') {
        // If Enter is pressed, check if we have a buffer
        if (buffer.length >= 3) {
          e.preventDefault();
          triggerScan(buffer);
          setBuffer('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [buffer]);

  const triggerScan = (scannedCode: string) => {
    setLastScanned(scannedCode);
    onScanSuccess(scannedCode);
    const found = members.find(
      (m) => m.barcode === scannedCode || m.card_id === scannedCode || m.id === scannedCode
    );
    if (found) {
      setMatchedMember(found);
      const audio = new Audio();
      // Simple synth beep or alert
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
      audio.play().catch(() => {});
    } else {
      setMatchedMember(null);
    }
    
    // Auto-clear message after 4 seconds
    setTimeout(() => {
      setLastScanned(null);
      setMatchedMember(null);
    }, 4000);
  };

  const handleManualScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedScan.trim()) {
      triggerScan(typedScan.trim());
      setTypedScan('');
    }
  };

  return (
    <div className="bg-slate-900 border-b border-cyan-500/20 px-4 py-2 text-white">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Active Wedge Status */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Barcode className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-slate-300">
            قارئ الباركود نشط ومفعل | <span className="text-cyan-400">Barcode Scanner Active</span>
          </span>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 hidden sm:inline">
            (السيستم يستمع تلقائياً لضربات كارت العضوية السريع)
          </span>
        </div>

        {/* Live scanner output alert */}
        {lastScanned && (
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-cyan-500/30 animate-pulse text-xs">
            <Scan className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>تم مسح كود: <strong className="font-mono text-cyan-400">{lastScanned}</strong></span>
            {matchedMember ? (
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> ({matchedMember.name})
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> غير مسجل
              </span>
            )}
          </div>
        )}

        {/* Interactive Simulator Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimPanel(!showSimPanel)}
            className="text-[11px] bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 px-3 py-1 rounded transition-colors text-cyan-300 font-medium"
          >
            {showSimPanel ? 'إخفاء محاكي الباركود ✕' : 'أظهر محاكي الباركود 🔍'}
          </button>
        </div>
      </div>

      {showSimPanel && (
        <div className="max-w-7xl mx-auto mt-2 p-3 bg-slate-950/80 rounded border border-cyan-500/15">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <p className="text-slate-300 font-medium mb-1 text-[11px]">
                💡 <strong>لتجربة قارئ الباركود (Barcode Scanner):</strong> يمكنك تمرير الكارت أو كتابة الكود هنا للتحقق، أو اضغط على أي كارت من الأعضاء الجاهزين بالأسفل للمحاكاة الفورية:
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {members.slice(0, 4).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => triggerScan(m.barcode)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 py-1 rounded border border-slate-700 text-[11px] transition-all flex items-center gap-1 font-mono"
                  >
                    <Barcode className="w-3 h-3 text-cyan-400" />
                    <span>{m.barcode} ({m.name.split(' ')[0]})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual test scanning input form */}
            <form onSubmit={handleManualScanSubmit} className="flex gap-1 w-full md:w-auto mt-2 md:mt-0">
              <input
                type="text"
                value={typedScan}
                onChange={(e) => setTypedScan(e.target.value)}
                placeholder="اكتب الباركود أو رقم الكارت..."
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono w-full md:w-48 placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-3 py-1 rounded text-xs transition-all flex items-center gap-1"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>مسح</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
