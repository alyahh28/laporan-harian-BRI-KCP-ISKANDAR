export default function PhotoLightbox({ photoSrc, onClose }) {
  if (!photoSrc) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau foto dokumentasi"
    >
      <div
        className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center text-lg font-bold z-10 transition-colors cursor-pointer"
          aria-label="Tutup pratinjau foto"
        >
          ×
        </button>
        <img
          src={photoSrc}
          alt="Dokumentasi Penuh"
          className="w-full h-auto max-h-[80vh] object-contain"
        />
      </div>
    </div>
  );
}

