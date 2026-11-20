import Icon from '../Icon.jsx';
import TransactionTypeSelect from './TransactionTypeSelect.jsx';
import { FOLLOW_UP_STATUS_OPTIONS } from './reportUtils.js';

export default function ReportInputForm({
  formType,
  title,
  transactionLabel,
  transactionOptions,
  form,
  recordsCount,
  linkedTask,
  message,
  isSaving,
  onFieldChange,
  onFollowUpStatusChange,
  onPhotoChange,
  onRemovePhoto,
  onPreviewPhoto,
  onUnlinkTask,
  onReset,
  onSubmit,
  onOpenReports,
}) {
  const isRMFT = formType === 'rmft';

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-8 pt-3 sm:pt-5 space-y-4 sm:space-y-6">
      {/* Hero Executive Banner */}
      <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#014181] via-[#002D5B] to-[#001D3D] text-white p-5 sm:p-7 shadow-[0_20px_50px_-15px_rgba(1,65,129,0.5)] border border-blue-900/30">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#FF7401]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7401] via-[#FF9B3D] to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FF7401] text-white shadow-xs">
                {isRMFT ? 'Funding & Transaction' : 'Lending & Financing'}
              </span>
              <span className="text-[11px] text-blue-200/80 font-medium">
                BRI KCP Iskandar
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {title}
            </h1>
            <p className="text-xs text-blue-100/80 max-w-xl leading-relaxed">
              {isRMFT
                ? 'Pencatatan kunjungan nasabah, pembukaan rekening simpanan, layanan merchant QRIS/EDC, dan aktivitas transaksi funding harian.'
                : 'Pencatatan kunjungan prospek, konsultasi dan analisa kredit, restrak kredit, serta tindak lanjut pinjaman nasabah.'}
            </p>
          </div>

          {/* Tombol Lihat Laporan */}
          <button
            type="button"
            onClick={onOpenReports}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all active:scale-95 shadow-sm backdrop-blur-md cursor-pointer"
          >
            <span className="inline-flex items-center gap-1.5"><Icon name="clipboard" size={14} /> Lihat Laporan</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#FF7401] text-[10px] font-bold">
              {recordsCount}
            </span>
          </button>
        </div>
      </section>

      {/* Main Form Card */}
      <section className="relative bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#014181] to-[#FF7401]" />

        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#014181] flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-[#FF7401]" />
              Input Data Nasabah & Transaksi
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 pl-3.5">
              Lengkapi data di bawah ini untuk mendokumentasikan aktivitas harian Anda.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">* Wajib diisi</span>
        </div>

        {/* Linked Follow-Up Task Banner */}
        {linkedTask && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-orange-200 bg-orange-50/90 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-2.5">
              <span className="mt-0.5 shrink-0 text-[#FF7401]">
                <Icon name="target" size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#B34A02]">
                  Tautan Tugas Tindak Lanjut
                </p>
                <p className="mt-0.5 text-xs font-bold text-slate-800 truncate">
                  Menindaklanjuti tugas: {linkedTask.customerName} — {linkedTask.activity || 'Pekerjaan'}
                </p>
                {linkedTask.note && (
                  <p className="mt-0.5 text-[11px] text-slate-600 break-words">
                    Catatan sebelumnya: {linkedTask.note}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onUnlinkTask}
              className="shrink-0 self-start rounded-xl border border-orange-300 bg-white px-3 py-1.5 text-[11px] font-bold text-[#B34A02] transition hover:bg-orange-100 sm:self-center cursor-pointer"
            >
              Lepas Tautan
            </button>
          </div>
        )}

        {/* Notification Banner */}
        {message.text && (
          <div
            role="status"
            className={`mb-5 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 border ${
              message.type === 'error'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            <span>
              <Icon
                name={message.type === 'error' ? 'warning' : message.type === 'success' ? 'check' : 'info'}
                size={15}
              />
            </span>
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
          {/* Row 1: Nama Lengkap & Status Nasabah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nama Lengkap Nasabah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={onFieldChange}
                placeholder="Masukkan nama lengkap nasabah"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 focus:border-[#014181] text-slate-800 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Status Nasabah <span className="text-red-500">*</span>
              </label>
              <select
                name="customerType"
                value={form.customerType}
                onChange={onFieldChange}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 focus:border-[#014181] text-slate-800 transition-all"
              >
                <option value="" disabled>
                  Pilih Status Nasabah
                </option>
                <option value="Nasabah">Nasabah BRI</option>
                <option value="Non-Nasabah">Non-Nasabah (Calon Nasabah)</option>
              </select>
            </div>
          </div>

          {/* Row 2: No. Identitas & No. HP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {form.customerType === 'Non-Nasabah'
                  ? 'No. KTP / NIK'
                  : 'No. Rekening / No. NIK'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="identityNumber"
                value={form.identityNumber}
                onChange={onFieldChange}
                placeholder={
                  form.customerType === 'Non-Nasabah'
                    ? 'Masukkan 16 digit NIK'
                    : 'Nomor rekening atau 16 digit NIK'
                }
                inputMode="numeric"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 focus:border-[#014181] text-slate-800 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                No. Handphone / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={onFieldChange}
                placeholder="Contoh: 081234567890"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 focus:border-[#014181] text-slate-800 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Row 3: Jenis Transaksi & Status Tindak Lanjut */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TransactionTypeSelect
              formType={formType}
              label={`${transactionLabel} (Aktivitas)`}
              value={form.transactionType}
              onChange={onFieldChange}
              customOptions={transactionOptions}
              placeholder={`Pilih ${transactionLabel.toLowerCase()}`}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Status Tindak Lanjut <span className="text-red-500">*</span>
              </label>
              <select
                name="followUpStatus"
                value={form.followUpStatus}
                onChange={onFollowUpStatusChange}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 focus:border-[#014181] text-slate-800 transition-all"
              >
                <option value="" disabled>
                  Pilih status tindak lanjut
                </option>
                {FOLLOW_UP_STATUS_OPTIONS.map((opt) => (
                  <option value={opt.value} key={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">
                {FOLLOW_UP_STATUS_OPTIONS.find((opt) => opt.value === form.followUpStatus)?.hint
                  || 'Pilih status tindak lanjut: Perlu Ditindaklanjuti atau Selesai.'}
              </p>
            </div>
          </div>

          {/* Keterangan Tindak Lanjut: Kondisional sesuai status yang dipilih */}
          {form.followUpStatus === 'pending' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Keterangan Tindak Lanjut (Rencana Langkah Berikutnya) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="followUp"
                rows="2"
                value={form.followUp}
                onChange={onFieldChange}
                placeholder="Contoh: Jadwalkan akad kredit / ambil kelengkapan berkas minggu depan"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 focus:border-[#014181] text-slate-800 transition-all placeholder:text-slate-400 resize-none"
              />
              <p className="text-[10px] font-semibold text-[#B34A02]">
                Wajib diisi karena status &quot;Perlu Ditindaklanjuti&quot; dipilih. Tugas akan masuk ke daftar aktif menu Tindak Lanjut.
              </p>
            </div>
          )}

          {form.followUpStatus === 'done' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Keterangan Penyelesaian (Hasil Penyelesaian)
              </label>
              <textarea
                name="followUp"
                rows="2"
                value={form.followUp}
                onChange={onFieldChange}
                placeholder="Contoh: Berkas telah lengkap dan rekening/fasilitas berhasil diproses dengan tuntas."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 focus:border-[#014181] text-slate-800 transition-all placeholder:text-slate-400 resize-none"
              />
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                <span className="mt-0.5 shrink-0 text-emerald-600">
                  <Icon name="check" size={14} />
                </span>
                <p className="text-[11px] font-semibold text-emerald-700">
                  Status &quot;Selesai&quot; dipilih — pekerjaan ditandai tuntas. Anda dapat mencatat keterangan penyelesaian di atas jika diperlukan.
                </p>
              </div>
            </div>
          )}

          {/* Row 4: Alamat Domisili */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Alamat Lengkap / Lokasi Kunjungan <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              rows="2"
              value={form.address}
              onChange={onFieldChange}
              placeholder="Masukkan alamat domisili atau lokasi usaha nasabah..."
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 focus:border-[#014181] text-slate-800 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Row 5: Upload Foto Dokumentasi */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Foto Dokumentasi Kunjungan
            </label>

            {form.photo ? (
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-blue-50/50 border border-blue-200/60">
                <img
                  src={form.photo}
                  alt="Pratinjau dokumentasi"
                  className="w-16 h-16 object-cover rounded-xl border border-blue-200 shadow-xs cursor-pointer hover:opacity-90"
                  onClick={() => onPreviewPhoto(form.photo)}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#014181] truncate">
                    {form.photoName || 'Foto Terlampir'}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    ✓ Foto siap diupload (terkompresi otomatis)
                  </p>
                  <button
                    type="button"
                    onClick={onRemovePhoto}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 mt-1 cursor-pointer"
                  >
                    Hapus Foto
                  </button>
                </div>
              </div>
            ) : (
              <label className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-[#FF7401]/60 rounded-2xl bg-slate-50/60 hover:bg-white transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#014181] group-hover:bg-orange-50 group-hover:text-[#FF7401] flex items-center justify-center text-lg mb-2 transition-colors">
                  <Icon name="camera" size={22} />
                </div>
                <p className="text-xs font-bold text-slate-700 group-hover:text-[#014181]">
                  Pilih Foto Dokumentasi
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Format PNG, JPG, JPEG (otomatis dioptimalkan)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Form Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onReset}
              className="w-1/3 sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="w-2/3 sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-[#FF7401] hover:bg-[#E56801] rounded-xl shadow-md shadow-[#FF7401]/30 hover:shadow-lg transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengupload...</span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5"><Icon name="upload" size={14} /> Upload Laporan</span>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

