import Icon from '../Icon.jsx';
import TransactionTypeSelect from './TransactionTypeSelect.jsx';
import { TRANSACTION_FORM_CONFIG } from '../../config/transactionOptions.js';
import {
  FOLLOW_UP_STATUS_OPTIONS,
  normalizeFollowUpStatus,
} from './reportUtils.js';

export default function ReportEditModal({
  editingRecord,
  fallbackFormType,
  customOptions,
  editError,
  isSaving,
  onFieldChange,
  onFollowUpStatusChange,
  onPhotoChange,
  onRemovePhoto,
  onSave,
  onClose,
}) {
  if (!editingRecord) return null;

  const targetFormType = editingRecord.formType || fallbackFormType;
  const transactionLabel = TRANSACTION_FORM_CONFIG[targetFormType]?.label || 'Jenis Transaksi';
  const effectiveCustomOptions = targetFormType === fallbackFormType ? customOptions : undefined;
  const isPending = normalizeFollowUpStatus(editingRecord.followUpStatus) === 'pending';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-[#FF7401] to-[#014181] shrink-0" />

        <div className="p-4 sm:p-6 pb-3 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-amber-600 uppercase">
              Perbarui Informasi
            </p>
            <h2 className="text-base sm:text-lg font-bold text-[#014181] mt-0.5">
              Edit Data Laporan
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Perubahan akan otomatis disinkronkan ke Supabase dan perangkat Anda.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all text-lg font-semibold active:scale-95 cursor-pointer"
            aria-label="Tutup modal edit"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {editError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700"
            >
              <span className="mt-0.5 shrink-0">
                <Icon name="warning" size={14} />
              </span>
              <span>{editError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Nama Lengkap</label>
              <input
                type="text"
                name="fullName"
                value={editingRecord.fullName}
                onChange={onFieldChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Status Nasabah</label>
              <select
                name="customerType"
                value={editingRecord.customerType}
                onChange={onFieldChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 text-slate-800"
              >
                <option value="Nasabah">Nasabah BRI</option>
                <option value="Non-Nasabah">Non-Nasabah</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                No. Rekening / NIK
              </label>
              <input
                type="text"
                name="identityNumber"
                value={editingRecord.identityNumber}
                onChange={onFieldChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">No. Handphone</label>
              <input
                type="tel"
                name="phone"
                value={editingRecord.phone}
                onChange={onFieldChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <TransactionTypeSelect
              formType={targetFormType}
              label={transactionLabel}
              value={editingRecord.transactionType}
              onChange={onFieldChange}
              customOptions={effectiveCustomOptions}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 text-slate-800"
            />

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Status Tindak Lanjut</label>
              <select
                name="followUpStatus"
                value={editingRecord.followUpStatus}
                onChange={onFollowUpStatusChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 text-slate-800"
              >
                {FOLLOW_UP_STATUS_OPTIONS.map((opt) => (
                  <option value={opt.value} key={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Keterangan tindak lanjut: kondisional sesuai status */}
          {isPending ? (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Keterangan Tindak Lanjut (Rencana Langkah Berikutnya) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="followUp"
                rows="2"
                value={editingRecord.followUp || ''}
                onChange={onFieldChange}
                placeholder="Contoh: Jadwalkan akad kredit / ambil berkas minggu depan"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 text-slate-800 resize-none"
              />
              <p className="text-[10px] font-semibold text-[#B34A02]">
                Wajib diisi karena status &quot;Perlu Ditindaklanjuti&quot; dipilih.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Keterangan Penyelesaian (Hasil Penyelesaian)
              </label>
              <textarea
                name="followUp"
                rows="2"
                value={editingRecord.followUp || ''}
                onChange={onFieldChange}
                placeholder="Contoh: Berkas telah lengkap dan rekening/fasilitas berhasil diproses dengan tuntas."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 text-slate-800 resize-none"
              />
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                <span className="mt-0.5 shrink-0 text-emerald-600">
                  <Icon name="check" size={14} />
                </span>
                <p className="text-[11px] font-semibold text-emerald-700">
                  Status &quot;Selesai&quot; dipilih. Anda dapat mencatat keterangan penyelesaian jika diperlukan.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Alamat Lengkap</label>
            <textarea
              name="address"
              rows="2"
              value={editingRecord.address}
              onChange={onFieldChange}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 text-slate-800 resize-none"
            />
          </div>

          {/* Ganti / Hapus Foto Dokumentasi */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Foto Dokumentasi</label>
            {editingRecord.photo ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <img
                  src={editingRecord.photo}
                  alt="Foto"
                  className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">Foto Terlampir</p>
                  <div className="flex items-center gap-2 mt-1">
                    <label className="text-[11px] font-bold text-[#014181] hover:underline cursor-pointer">
                      Ganti Foto
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onPhotoChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={onRemovePhoto}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Hapus Foto
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-4 border border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs font-bold text-[#014181]">
                <span className="inline-flex items-center gap-1.5"><Icon name="camera" size={14} /> Upload Foto Baru</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-[#014181] hover:bg-[#0A5AA3] rounded-xl transition-all active:scale-95 shadow-sm disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

