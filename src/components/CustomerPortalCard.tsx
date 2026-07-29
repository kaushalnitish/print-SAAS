import React, { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { QrCode, Copy, Check, Download, Printer, ExternalLink, Sparkles, Smartphone } from 'lucide-react';
import { Shop } from '../context/SaaSContext';

interface CustomerPortalCardProps {
  shop: Shop;
}

export const CustomerPortalCard: React.FC<CustomerPortalCardProps> = ({ shop }) => {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const shopSlug = shop.slug || shop.shopSlug || 'main';
  const shopName = shop.name || shop.shopName || 'Print Shop';
  const portalUrl = `${window.location.origin}${window.location.pathname}#/s/${shopSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadQR = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${shopSlug}-counter-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Counter Sign - ${shopName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              text-align: center;
              padding: 40px;
              margin: 0;
              background: #ffffff;
              color: #0f172a;
            }
            .card {
              max-width: 480px;
              margin: 0 auto;
              border: 3px solid #0f172a;
              border-radius: 28px;
              padding: 40px 30px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            }
            .brand {
              font-size: 14px;
              font-weight: 800;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #4f46e5;
              margin-bottom: 8px;
            }
            .shop-name {
              font-size: 28px;
              font-weight: 800;
              margin: 0 0 16px 0;
            }
            .qr-wrapper {
              background: #f8fafc;
              padding: 24px;
              border-radius: 20px;
              display: inline-block;
              border: 2px border #e2e8f0;
              margin: 20px 0;
            }
            .instructions {
              font-size: 18px;
              font-weight: 800;
              color: #1e293b;
              margin-top: 12px;
            }
            .subtext {
              font-size: 13px;
              color: #64748b;
              margin-top: 6px;
            }
            .url {
              font-family: monospace;
              font-size: 12px;
              color: #4f46e5;
              background: #eef2ff;
              padding: 6px 12px;
              border-radius: 8px;
              display: inline-block;
              margin-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">PrintFlow Cloud Counter</div>
            <div class="shop-name">${shopName}</div>
            <div class="instructions">Scan to Print Documents</div>
            <div class="subtext">No app download or chat required. Scan & upload directly.</div>
            <div class="qr-wrapper">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(portalUrl)}" width="220" height="220" alt="Counter QR Code" />
            </div>
            <div>
              <span class="url">${portalUrl}</span>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
      {/* Hidden canvas for downloading crisp PNG */}
      <div className="hidden" ref={canvasRef}>
        <QRCodeCanvas value={portalUrl} size={400} level="H" includeMargin={true} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <QrCode className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Customer Portal</h2>
            <span className="text-[10px] uppercase font-extrabold bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Live QR
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Display this QR code at your shop counter. Customers scan it to upload files and select print settings instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: QR Display Box */}
        <div className="md:col-span-4 bg-slate-50 border border-slate-200/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 relative group">
          <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100 group-hover:scale-105 transition-transform duration-300">
            <QRCodeSVG 
              value={portalUrl} 
              size={140} 
              level="H" 
              includeMargin={false}
              fgColor="#0f172a"
            />
          </div>
          <div>
            <p className="text-xs font-black text-slate-800">Shop Counter Sign</p>
            <p className="text-[11px] font-semibold text-slate-400">Scan to Upload & Print</p>
          </div>
        </div>

        {/* Right: Actions & Portal URL */}
        <div className="md:col-span-8 space-y-5">
          {/* Portal URL Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Customer Upload URL</span>
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 pl-3.5">
              <span className="font-mono text-xs font-bold text-indigo-600 truncate flex-1">
                {portalUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg transition-all cursor-pointer shrink-0 shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Download & Print Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-extrabold text-xs px-4 py-3 rounded-xl border border-slate-200/80 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Download QR Image</span>
            </button>

            <button
              type="button"
              onClick={handlePrintQR}
              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-md shadow-indigo-600/15 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-indigo-100" />
              <span>Print Counter Sign</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
