'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, QrCode, Link2 } from 'lucide-react';

export default function QrCafeteria({ urlTienda }: { urlTienda?: string }) {
  const [urlDestino, setUrlDestino] = useState(urlTienda || '');
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!urlTienda && typeof window !== 'undefined') {
      setUrlDestino(window.location.origin);
    }
  }, [urlTienda]);

  // Genera una imagen PNG de alta resolución (800x1050) con toda la tarjeta centrada lista para imprimir
  const descargarTarjetaQr = () => {
    const qrCanvas = qrRef.current?.querySelector('canvas');
    if (!qrCanvas) return;

    const exportCanvas = document.createElement('canvas');
    const width = 800;
    const height = 1040;
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // 1. Fondo crema principal (#FAF6F2)
    ctx.fillStyle = '#FAF6F2';
    ctx.fillRect(0, 0, width, height);

    // 2. Borde exterior sutil
    ctx.strokeStyle = 'rgba(59, 31, 20, 0.15)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(24, 24, width - 48, height - 48, 56);
    ctx.stroke();

    // 3. Subtítulo superior
    ctx.fillStyle = '#9C6644';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ESCANEÁ NUESTRO MENÚ', width / 2, 120);

    // 4. Título principal LES ANTOJA?
    ctx.fillStyle = '#3B1F14';
    ctx.font = 'bold 54px Georgia, serif';
    ctx.fillText('LES ANTOJA?', width / 2, 185);

    // 5. Marco durazno pastel centrado (#F5CBB0)
    const marcoSize = 540;
    const marcoX = (width - marcoSize) / 2;
    const marcoY = 245;
    ctx.fillStyle = 'rgba(245, 203, 176, 0.6)';
    ctx.beginPath();
    ctx.roundRect(marcoX, marcoY, marcoSize, marcoSize, 48);
    ctx.fill();

    // 6. Recuadro crema interior centrado
    const innerSize = 460;
    const innerX = (width - innerSize) / 2;
    const innerY = marcoY + (marcoSize - innerSize) / 2;
    ctx.fillStyle = '#FAF6F2';
    ctx.beginPath();
    ctx.roundRect(innerX, innerY, innerSize, innerSize, 32);
    ctx.fill();

    // 7. Dibujar el QR exactamente en el centro
    const qrDrawSize = 410;
    const qrX = (width - qrDrawSize) / 2;
    const qrY = innerY + (innerSize - qrDrawSize) / 2;
    ctx.drawImage(qrCanvas, qrX, qrY, qrDrawSize, qrDrawSize);

    // 8. Texto inferior centrado
    ctx.fillStyle = '#6F4E37';
    ctx.font = '24px sans-serif';
    ctx.fillText('Cookies • Café de especialidad', width / 2, 865);
    ctx.fillText('Tortas personalizadas', width / 2, 905);

    const link = document.createElement('a');
    link.href = exportCanvas.toDataURL('image/png');
    link.download = 'QR-Les-Antoja-Impresion.png';
    link.click();
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-[#EADCD0] space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-[#F5CBB0] text-[#3B1F14] flex items-center justify-center shrink-0">
          <QrCode className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold leading-none">
            Código QR para Mesas y Mostrador
          </h2>
          <p className="text-xs text-[#6F4E37] mt-1">
            QR estático directo: no vence nunca y abre tu catálogo al instante.
          </p>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-bold uppercase text-[#6F4E37] flex items-center gap-1.5 mb-1.5">
          <Link2 className="w-3.5 h-3.5" /> Enlace al que apunta el QR
        </label>
        <input
          type="text"
          value={urlDestino}
          onChange={(e) => setUrlDestino(e.target.value)}
          placeholder="https://tu-tienda.vercel.app"
          className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F2] border border-[#EADCD0] text-xs font-mono text-[#3B1F14] focus:outline-none focus:border-[#3B1F14]"
        />
      </div>

      {/* Vista previa 100% simétrica y centrada */}
      <div className="flex justify-center py-2">
        <div className="bg-[#FAF6F2] p-7 rounded-[2.25rem] border-2 border-[#3B1F14]/15 flex flex-col items-center text-center space-y-5 shadow-md w-full max-w-[320px]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#9C6644] font-bold block">
              Escaneá nuestro menú
            </span>
            <p className="font-serif text-2xl font-bold text-[#3B1F14] mt-0.5">
              LES ANTOJA?
            </p>
          </div>

          <div
            ref={qrRef}
            className="flex items-center justify-center p-4 rounded-3xl bg-[#F5CBB0]/65 border border-[#3B1F14]/15 mx-auto"
          >
            <div className="bg-[#FAF6F2] p-3 rounded-2xl flex items-center justify-center">
              {urlDestino && (
                <QRCodeCanvas
                  value={urlDestino}
                  size={196}
                  bgColor="#FAF6F2"
                  fgColor="#3B1F14"
                  level="H"
                  imageSettings={{
                    src: '/logo.jpeg',
                    height: 44,
                    width: 44,
                    excavate: true,
                  }}
                />
              )}
            </div>
          </div>

          <p className="text-[11px] text-[#6F4E37] leading-relaxed max-w-[230px]">
            Cookies • Café de especialidad • Tortas personalizadas
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={descargarTarjetaQr}
        className="w-full py-3.5 rounded-full bg-[#3B1F14] hover:bg-[#5A3222] text-[#FAF6F2] text-xs font-bold flex items-center justify-center gap-2 transition shadow-md"
      >
        <Download className="w-4 h-4" /> Descargar Tarjeta QR Lista para Imprimir (PNG)
      </button>
    </div>
  );
}