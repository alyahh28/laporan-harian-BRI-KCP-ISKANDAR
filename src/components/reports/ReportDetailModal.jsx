import Icon from '../Icon.jsx';
import { formatWhatsAppUrl, normalizeFollowUpStatus } from './reportUtils.js';

export default function ReportDetailModal({
  record,
  formType,
  user,
  isAdmin,
  copiedId,
  canManage,
  onCopyIdentity,
  onEdit,
  onDelete,
  onPreviewPhoto,
  onClose,
}) {
  if (!record) return null;

  const isPending = normalizeFollowUpStatus(record.followUpStatus) === 'pending';
  const whatsappUrl = formatWhatsAppUrl(record.phone);

  return (
    <>
      <article className="report-print-document" aria-hidden="true">
        <header className="report-print-header">
          <img src="/Img/bri-logo.png" alt="Bank BRI" />
          <div>
            <p>BRI DIGITAL</p>
            <h1>LAPORAN KUNJUNGAN NASABAH</h1>
            <span>
              {(record.formType || formType) === 'rmft'
                ? 'Relationship Manager Funding & Transaksi'
                : 'Relationship Manager SME'}
            </span>
          </div>
        </header>

        <p className="report-print-intro">
          Berikut disampaikan laporan kegiatan dan tindak lanjut nasabah yang telah dicatat melalui aplikasi Laporan Harian Relationship Manager.
        </p>

        <table className="report-print-table">
          <tbody>
            <tr>
              <th>Nama Nasabah</th>
              <td>{record.fullName || '-'}</td>
            </tr>
            <tr>
              <th>Status Nasabah</th>
              <td>{record.customerType || '-'}</td>
            </tr>
            <tr>
              <th>No. Rekening / NIK</th>
              <td>{record.identityNumber || '-'}</td>
            </tr>
            <tr>
              <th>No. Handphone / WhatsApp</th>
              <td>{record.phone || '-'}</td>
            </tr>
            <tr>
              <th>Alamat / Lokasi Kunjungan</th>
              <td>{record.address || '-'}</td>
            </tr>
            <tr>
              <th>Jenis Layanan / Transaksi</th>
              <td>{record.transactionType || '-'}</td>
            </tr>
            <tr>
              <th>Status Tindak Lanjut</th>
              <td>{isPending ? 'Perlu Tindak Lanjut' : 'Sudah Selesai'}</td>
            </tr>
            <tr>
              <th>Keterangan Tindak Lanjut / Penyelesaian</th>
              <td>
                {isPending
                  ? record.followUp || '-'
                  : record.followUp || 'Pekerjaan selesai tanpa catatan tambahan'}
              </td>
            </tr>
            <tr>
              <th>Waktu Pencatatan</th>
              <td>
                {new Intl.DateTimeFormat('id-ID', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                }).format(new Date(record.createdAt))}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="report-print-note">
          Laporan ini dibuat secara elektronik berdasarkan data yang dicatat oleh petugas.
        </p>

        <footer className="report-print-signatures">
          <div>
            <p>Petugas Relationship Manager,</p>
            <strong>{record.userName || user?.name || 'Pegawai'}</strong>
          </div>
          <div>
            <p>Mengetahui,</p>
            <strong>________________________</strong>
          </div>
        </footer>
        <p className="report-print-generated">
          Dicetak pada {new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'full',
            timeStyle: 'short',
          }).format(new Date())}
        </p>
      </article>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
          {/* Top Bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#014181] via-[#0A5AA3] to-[#FF7401] shrink-0" />

          {/* Header Detail */}
          <div className="p-4 sm:p-6 pb-3 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-[#FF7401]" />
                <p className="text-[10px] font-bold tracking-wider text-[#FF7401] uppercase">
                  Rincian Nasabah
                </p>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#014181] mt-0.5 truncate">
                {record.fullName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    record.customerType === 'Nasabah'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {record.customerType || 'Nasabah'}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#014181] border border-blue-200">
                  {record.transactionType}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isPending
                      ? 'bg-orange-50 text-[#B34A02] border-orange-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  <Icon name={isPending ? 'target' : 'check'} size={11} />
                  {isPending ? 'Perlu Tindak Lanjut' : 'Sudah Selesai'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all text-lg font-semibold active:scale-95 shrink-0 cursor-pointer"
              aria-label="Tutup rincian"
            >
              ×
            </button>
          </div>

          {/* Body Detail Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
            {/* Box 1: Informasi Kontak & Identitas */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-[11px] font-semibold text-slate-500">
                  {record.customerType === 'Non-Nasabah'
                    ? 'No. NIK / KTP'
                    : 'No. Rekening / NIK'}
                </span>
                <div className="flex items-center gap-1.5">
                  <strong className="text-xs text-[#014181] font-mono">
                    {record.identityNumber || '-'}
                  </strong>
                  {record.identityNumber && (
                    <button
                      type="button"
                      onClick={() => onCopyIdentity(record.identityNumber)}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-[#014181] font-semibold p-1 cursor-pointer"
                      title="Salin nomor"
                    >
                      {copiedId ? '✓ Tersalin' : <><Icon name="clipboard" size={12} /> Salin</>}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-[11px] font-semibold text-slate-500">
                  No. Handphone / WA
                </span>
                <div className="flex items-center gap-2">
                  <strong className="text-xs text-slate-800 font-mono">
                    {record.phone || '-'}
                  </strong>
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 hover:bg-emerald-100"
                    >
                      <Icon name="chat" size={12} /> Chat WA
                    </a>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Alamat Domisili / Lokasi
                </span>
                <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 leading-relaxed break-words">
                  {record.address || 'Alamat tidak dicantumkan.'}
                </p>
              </div>
            </div>

            {/* Box 2: Detail Transaksi & Rencana Follow Up */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-[11px] font-semibold text-slate-500">
                  Layanan Transaksi
                </span>
                <strong className="text-xs text-[#014181] text-right break-words">
                  {record.transactionType || '-'}
                </strong>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Rencana Tindak Lanjut (Follow-Up)
                </span>
                {isPending ? (
                  <>
                    <p className="text-xs bg-white p-2.5 rounded-xl border border-orange-200/60 text-[#B34A02] font-semibold break-words">
                      {record.followUp || 'Keterangan tindak lanjut belum diisi.'}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#B34A02]">
                      <Icon name="target" size={11} />
                      Masih perlu ditindaklanjuti
                    </p>
                  </>
                ) : (
                  <div className="space-y-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <Icon name="check" size={14} />
                      <span>Pekerjaan Selesai</span>
                    </div>
                    {record.followUp ? (
                      <p className="rounded-lg bg-white p-2 text-xs text-slate-700 break-words border border-emerald-100 leading-relaxed">
                        {record.followUp}
                      </p>
                    ) : (
                      <p className="text-xs text-emerald-700">
                        Pekerjaan ditandai selesai tanpa catatan tambahan.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <span>Waktu Pencatatan Laporan</span>
                <span className="font-semibold text-slate-600">
                  {new Intl.DateTimeFormat('id-ID', {
                    dateStyle: 'full',
                    timeStyle: 'medium',
                  }).format(new Date(record.createdAt))}
                </span>
              </div>
            </div>

            {/* Box 3: Foto Dokumentasi */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Foto Dokumentasi Kunjungan
              </span>
              {record.photo ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-50">
                  <img
                    src={record.photo}
                    alt="Dokumentasi Kunjungan"
                    className="w-full max-h-64 object-contain mx-auto cursor-pointer"
                    onClick={() => onPreviewPhoto(record.photo)}
                  />
                  <div
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => onPreviewPhoto(record.photo)}
                  >
                    <span className="inline-flex items-center gap-1 text-white text-xs font-bold px-3 py-1.5 rounded-full bg-black/60">
                      <Icon name="eye" size={13} /> Klik untuk perbesar
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                  Tidak ada foto dokumentasi terlampir.
                </div>
              )}
            </div>
          </div>

          {/* Footer Detail */}
          <div className="p-3 sm:p-4 px-4 sm:px-6 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {canManage && (
                <button
                  type="button"
                  onClick={() => onEdit(record)}
                  className="px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Icon name="edit" size={13} />
                  <span>Edit Data</span>
                </button>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onDelete(record.id, record.fullName)}
                  className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Icon name="trash" size={13} />
                  <span>Hapus</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#014181] hover:bg-[#0A5AA3] rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                Unduh PDF
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

