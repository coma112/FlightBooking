import { useEffect, useRef } from "react";
import './QrCode.css';

interface QrCodeProps {
    value: string;
    size?: number;
    label?: string;
}

export default function QrCode({ value, size = 200, label }: QrCodeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        generateQr(value, size);
    }, [value, size]);

    const generateQr = async (text: string, sz: number) => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        ctx.fillStyle = '#f0f7ff';
        ctx.fillRect(0, 0, sz, sz);
        ctx.fillStyle = '#0078D4';
        ctx.font = `${sz * 0.08}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('QR betöltés...', sz / 2, sz / 2);
    };

    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&format=png&margin=8&color=005A9E&bgcolor=FFFFFF`;

    return (
    <div className="qr-wrapper">
      <div className="qr-container" style={{ width: size, height: size }}>
        <img
          src={qrApiUrl}
          alt={`QR kód: ${value}`}
          width={size}
          height={size}
          style={{ display: 'block', borderRadius: '8px' }}
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = 'none';
            const parent = t.parentElement;
            if (parent && !parent.querySelector('.qr-fallback')) {
              const fb = document.createElement('div');
              fb.className = 'qr-fallback';
              fb.style.cssText = `width:${size}px;height:${size}px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f0f7ff;border-radius:8px;border:2px dashed #0078D4;font-family:monospace;font-size:12px;color:#005A9E;text-align:center;padding:12px;box-sizing:border-box;`;
              fb.innerHTML = `<div style="font-size:24px;margin-bottom:8px;">📱</div><div style="font-weight:700;margin-bottom:4px;">Check-in QR</div><div style="font-size:10px;word-break:break-all;opacity:0.7">${value}</div>`;
              parent.appendChild(fb);
            }
          }}
        />
      </div>
      {label && <p className="qr-label">{label}</p>}
    </div>
  );
}