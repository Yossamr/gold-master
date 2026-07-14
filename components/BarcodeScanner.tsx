import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, AlertTriangle } from 'lucide-react';

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onClose: () => void;
}

export const BarcodeScanner = ({ onDetected, onClose }: BarcodeScannerProps) => {
  const [status, setStatus] = useState<'loading' | 'scanning' | 'error'>('loading');
  const [errMsg, setErrMsg] = useState('');
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const handleManualSubmit = () => {
    const code = manualCode.trim();
    if (!code) return;

    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .then(() => {
          onDetected(code);
        })
        .catch(() => {
          onDetected(code);
        });
    } else {
      onDetected(code);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let html5QrCode: Html5Qrcode | null = null;
    let isStopping = false;

    const startScanner = async () => {
      try {
        setStatus('loading');
        
        // Ensure element exists in DOM before initializing
        const element = document.getElementById("barcode-scanner-reader");
        if (!element) {
          console.error("Scanner DOM element not found");
          return;
        }

        html5QrCode = new Html5Qrcode("barcode-scanner-reader", {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.DATA_MATRIX
          ],
          verbose: false
        });
        scannerRef.current = html5QrCode;
        
        const config = {
          fps: 20,
          qrbox: (width: number, height: number) => {
            const size = Math.min(width, height) * 0.75;
            return { width: size, height: size };
          },
          experimentalFeatures: { useBarCodeDetectorIfSupported: true }
        };

        // Attempt facingMode environment first
        try {
          await html5QrCode.start(
            { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
            config,
            (decodedText) => {
              const code = decodedText?.trim();
              if (code && isMounted && !isStopping) {
                decodedText = code;
                isStopping = true;
                html5QrCode?.stop()
                  .then(() => {
                    if (isMounted) onDetected(decodedText);
                  })
                  .catch(() => {
                    if (isMounted) onDetected(decodedText);
                  });
              }
            },
            () => {
              // Ignore frame scan failures
            }
          );
        } catch (err) {
          console.log("Environment facingMode failed, checking available cameras...", err);
          // Fallback: Query all cameras
          const devices = await Html5Qrcode.getCameras().catch(() => []);
          if (devices && devices.length > 0 && isMounted) {
            // Select the last camera (usually back camera on mobiles)
            const cameraId = devices[devices.length - 1].id;
            await html5QrCode.start(
              cameraId,
              config,
              (decodedText) => {
              const code = decodedText?.trim();
              if (code && isMounted && !isStopping) {
                decodedText = code;
                  isStopping = true;
                  html5QrCode?.stop()
                    .then(() => {
                      if (isMounted) onDetected(decodedText);
                    })
                    .catch(() => {
                      if (isMounted) onDetected(decodedText);
                    });
                }
              },
              () => {
                // Ignore frame scan failures
              }
            );
          } else {
            throw err; // no cameras or failed
          }
        }

        if (!isMounted && html5QrCode) {
          if (html5QrCode.isScanning) {
            html5QrCode.stop().catch(() => {});
          }
        } else {
          setStatus('scanning');
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Camera or scanner initialization error', err);
          const isPermissionErr = err.name === 'NotAllowedError' || err.message?.includes('Permission') || err.message?.includes('allowed');
          setErrMsg(isPermissionErr ? 'الرجاء السماح بالوصول للكاميرا في إعدادات المتصفح' : 'تعذر تشغيل الكاميرا. يرجى التحقق من التوصيل.');
          setStatus('error');
        }
      }
    };

    // Slight delay to let DOM settle and make sure any previous instance is fully stopped
    const timer = setTimeout(() => {
      if (isMounted) {
        startScanner();
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCode) {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().catch((e) => console.warn('Error during scanner unmount stop', e));
        }
      }
      scannerRef.current = null;
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col" dir="rtl">
      <div className="flex items-center justify-between p-4 bg-black/80 shrink-0 z-10 border-b border-white/5">
        <button 
          type="button"
          onClick={() => onClose()} 
          className="p-2 rounded-full bg-white/10 text-white active:scale-95"
        >
          <X size={22} />
        </button>
        <span className="text-white font-bold">سكانر الباركود</span>
        <div className="w-10" />
      </div>
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {status === 'loading' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black">
            <div className="w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
            <p className="text-white/60 text-sm">جاري تشغيل الكاميرا...</p>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 p-8 bg-black">
            <AlertTriangle size={48} className="text-rose-400" />
            <p className="text-white text-center font-bold">{errMsg}</p>
            <button 
              type="button"
              onClick={() => onClose()} 
              className="px-6 py-3 rounded-2xl bg-gold-500 text-black font-bold"
            >
              رجوع
            </button>
          </div>
        )}
        
        <div id="barcode-scanner-reader" className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />
        
        {status === 'scanning' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative w-64 h-64">
              {['top-0 right-0 border-t-4 border-r-4','top-0 left-0 border-t-4 border-l-4','bottom-0 right-0 border-b-4 border-r-4','bottom-0 left-0 border-b-4 border-l-4'].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 ${cls} border-gold-400 rounded-sm`} />
              ))}
              <div className="absolute inset-x-0 h-0.5 bg-gold-400 animate-pulse" style={{ top: '50%', boxShadow: '0 0 8px rgba(251,191,36,0.8)' }} />
              <p className="absolute -bottom-10 inset-x-0 text-center text-white/70 text-sm font-bold">وجّه الكاميرا نحو الباركود</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Manual Input Fallback */}
      <div className="p-4 bg-black/95 border-t border-white/10 shrink-0 z-10 flex gap-2">
        <input 
          type="text" 
          placeholder="أدخل رقم الباركود يدويًا..." 
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white font-bold text-center outline-none focus:border-gold-500/50"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleManualSubmit();
            }
          }}
        />
        <button 
          type="button"
          onClick={handleManualSubmit}
          className="px-5 py-2.5 bg-gold-500 text-black font-black rounded-xl active:scale-95 transition-all shrink-0 text-xs"
        >
          تأكيد
        </button>
      </div>
    </div>
  );
};
