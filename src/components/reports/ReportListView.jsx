import Icon from '../Icon.jsx';
import {
  formatWhatsAppUrl,
  getFormTypeLabel,
  normalizeFollowUpStatus,
} from './reportUtils.js';

export default function ReportListView({
  formType,
  title,
  isAllReports,
  isAdmin,
  sortedRecords,
  filteredRecords,
  followUpCounts,
  searchTerm,
  statusFilter,
  followUpFilter,
  reportTypeFilter,
  reportsLoadError,
  isLoadingReports,
  canManageRecord,
  onSearchChange,
  onStatusFilterChange,
  onFollowUpFilterChange,
  onReportTypeFilterChange,
  onOpenForm,
  onSelectDetail,
  onStartEdit,
  onDeleteRecord,
  onPreviewPhoto,
}) {
  const isRMFT = formType === 'rmft';

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-5">
      {/* Hero Banner Laporan */}
      <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#014181] via-[#002D5B] to-[#001D3D] text-white p-5 sm:p-7 shadow-[0_20px_50px_-15px_rgba(1,65,129,0.5)] border border-blue-900/30">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#FF7401]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7401] via-[#FF9B3D] to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FF7401] text-white shadow-xs">
                {isAllReports ? 'Rekap Gabungan' : isRMFT ? 'Rekap Funding' : 'Rekap Kredit'}
              </span>
              <span className="text-[11px] text-blue-200/80 font-medium">
                {isAllReports ? 'Semua data tersimpan' : 'Ruang kerja laporan Anda'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-sm truncate">
              {isAllReports ? 'Semua Laporan' : `Laporan ${title}`}
            </h1>
            <p className="text-xs text-blue-100/80 max-w-xl leading-relaxed">
              {isAllReports
                ? 'Daftar gabungan laporan RMFT dan RM SME dari seluruh pegawai, diurutkan dari yang terbaru.'
                : 'Kelola laporan yang Anda buat. Buka detail atau edit laporan kapan saja.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white">
                {sortedRecords.length} laporan
              </span>
              <span className="rounded-full border border-orange-300/30 bg-orange-400/10 px-2.5 py-1 text-[10px] font-bold text-orange-100">
                {followUpCounts.pending} perlu tindak lanjut
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-100">
                {followUpCounts.done} selesai
              </span>
            </div>
          </div>

          {!isAllReports && (
            <button
              type="button"
              onClick={onOpenForm}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#014181] hover:bg-blue-50 text-xs font-bold transition-all active:scale-95 shadow-md cursor-pointer whitespace-nowrap"
            >
              <span>+ Upload Laporan Baru</span>
            </button>
          )}
        </div>
      </section>

      {/* Filter & Pencarian Laporan */}
      <section className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-3 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Input Search */}
          <div className="relative flex-1 min-w-0">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari berdasarkan nama nasabah, NIK, nomor HP, atau transaksi..."
              className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 focus:border-[#014181] text-slate-800 transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs w-4 h-4 rounded-full flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Kategori Laporan */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
            {isAllReports && (
              <>
                <button
                  type="button"
                  onClick={() => onReportTypeFilterChange('ALL')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    reportTypeFilter === 'ALL'
                      ? 'bg-[#014181] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Jenis
                </button>
                <button
                  type="button"
                  onClick={() => onReportTypeFilterChange('rmft')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    reportTypeFilter === 'rmft'
                      ? 'bg-[#014181] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  RMFT
                </button>
                <button
                  type="button"
                  onClick={() => onReportTypeFilterChange('rmkredit')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    reportTypeFilter === 'rmkredit'
                      ? 'bg-[#014181] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  RM SME
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onStatusFilterChange('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-[#014181] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({sortedRecords.length})
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange('Nasabah')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'Nasabah'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Nasabah BRI
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange('Non-Nasabah')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'Non-Nasabah'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Non-Nasabah
            </button>
          </div>
        </div>

        {/* Filter Status Tindak Lanjut */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5">
          <span className="mr-0.5 text-[11px] font-bold text-slate-500">
            Tindak lanjut:
          </span>
          <button
            type="button"
            onClick={() => onFollowUpFilterChange('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              followUpFilter === 'ALL'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Status
          </button>
          <button
            type="button"
            onClick={() => onFollowUpFilterChange('pending')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              followUpFilter === 'pending'
                ? 'bg-[#FF7401] text-white shadow-xs'
                : 'bg-orange-50 text-[#B34A02] hover:bg-orange-100 border border-orange-200/70'
            }`}
          >
            <Icon name="target" size={13} />
            Perlu Tindak Lanjut
            <span className={`rounded-full px-1.5 text-[10px] ${followUpFilter === 'pending' ? 'bg-white/25' : 'bg-orange-100'}`}>
              {followUpCounts.pending}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onFollowUpFilterChange('done')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              followUpFilter === 'done'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70'
            }`}
          >
            <Icon name="check" size={13} />
            Sudah Selesai
            <span className={`rounded-full px-1.5 text-[10px] ${followUpFilter === 'done' ? 'bg-white/25' : 'bg-emerald-100'}`}>
              {followUpCounts.done}
            </span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-slate-500 border-t border-slate-100 pt-2 px-1">
          <span>
            Menampilkan <strong>{filteredRecords.length}</strong> dari{' '}
            <strong>{sortedRecords.length}</strong> total laporan
          </span>
          <span className="text-[#FF7401] font-semibold flex items-center gap-1">
            <span>↓</span>
            <span>Urutan: Data Terbaru Paling Atas</span>
          </span>
        </div>
      </section>

      {/* DAFTAR CARD LAPORAN */}
      {reportsLoadError && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800" role="alert">
          {reportsLoadError}
        </p>
      )}

      {isLoadingReports ? (
        <p className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center text-sm text-slate-500" role="status">
          Memuat laporan...
        </p>
      ) : filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4 items-stretch">
          {filteredRecords.map((record, index) => {
            const needsFollowUp = normalizeFollowUpStatus(record.followUpStatus) === 'pending';
            const isNewest = index === 0 && !searchTerm && statusFilter === 'ALL'
              && followUpFilter === 'ALL' && reportTypeFilter === 'ALL';
            const whatsappUrl = formatWhatsAppUrl(record.phone);
            const followUpNote = needsFollowUp
              ? record.followUp || 'Keterangan belum diisi'
              : record.followUp || 'Pekerjaan selesai tanpa catatan tambahan';

            return (
              <div
                key={record.id}
                className={`relative bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex flex-col justify-between overflow-hidden min-w-0 ${
                  isNewest
                    ? 'border-[#FF7401]/50 ring-1 ring-[#FF7401]/15 bg-gradient-to-b from-orange-50/30 via-white to-white'
                    : 'border-slate-200/80 hover:border-blue-200/80'
                }`}
              >
                <span
                  className={`absolute inset-x-0 top-0 h-1 ${
                    needsFollowUp
                      ? 'bg-gradient-to-r from-[#FF7401] to-amber-300'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-300'
                  }`}
                  aria-hidden="true"
                />
                <div className="space-y-3 min-w-0">
                  {/* Header Baris: Badge Terbaru (jika ada), Status, & Tanggal */}
                  <div className="space-y-2 pb-2.5 border-b border-slate-100 min-w-0">
                    {isNewest && (
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF7401] to-[#FF9B3D] text-black text-[10px] font-extrabold tracking-wider uppercase w-fit shadow-xs">
                        <Icon name="sparkles" size={13} />
                        <span>Terbaru Diupload</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                        {isAllReports && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#014181]/10 text-[#014181] border border-[#014181]/15 shrink-0">
                            {getFormTypeLabel(record.formType)}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap ${
                            record.customerType === 'Nasabah'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {record.customerType || 'Nasabah'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#014181] border border-blue-200 truncate min-w-0">
                          {record.transactionType || 'Transaksi'}
                        </span>
                      </div>

                      <time className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 shrink-0 whitespace-nowrap">
                        {new Intl.DateTimeFormat('id-ID', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        }).format(new Date(record.createdAt))}
                      </time>
                    </div>
                  </div>

                  {/* Strip Status Tindak Lanjut */}
                  <div
                    className={`flex items-start gap-2 rounded-xl px-2.5 py-2 border min-w-0 ${
                      needsFollowUp
                        ? 'bg-orange-50/90 border-orange-200/70'
                        : 'bg-emerald-50/90 border-emerald-200/70'
                    }`}
                  >
                    <span
                      className={`mt-0.5 shrink-0 ${
                        needsFollowUp ? 'text-[#FF7401]' : 'text-emerald-600'
                      }`}
                    >
                      <Icon name={needsFollowUp ? 'target' : 'check'} size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[10px] font-extrabold uppercase tracking-wide ${
                          needsFollowUp ? 'text-[#B34A02]' : 'text-emerald-700'
                        }`}
                      >
                        {needsFollowUp ? 'Perlu Tindak Lanjut' : 'Sudah Selesai'}
                      </p>
                      <p
                        className={`truncate text-[11px] ${
                          needsFollowUp
                            ? 'font-semibold text-[#8A3A02]'
                            : 'text-emerald-700/80'
                        }`}
                        title={followUpNote}
                      >
                        {followUpNote}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info Row */}
                  <div className="flex items-start gap-3 min-w-0">
                    {record.photo ? (
                      <img
                        src={record.photo}
                        alt={record.fullName}
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0 shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => onPreviewPhoto(record.photo)}
                        title="Klik untuk perbesar foto"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-lg shrink-0">
                        <Icon name="user" size={21} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h3 className="text-sm font-bold text-[#014181] truncate" title={record.fullName}>
                        {record.fullName}
                      </h3>
                      {record.userName && (
                        <p className="truncate text-[10px] font-medium text-slate-400">
                          Dibuat oleh {record.userName}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500 truncate">
                        <span className="font-semibold text-slate-700">
                          {record.customerType === 'Non-Nasabah' ? 'NIK:' : 'No. Rek/NIK:'}
                        </span>{' '}
                        <span className="font-mono text-slate-700">{record.identityNumber || '-'}</span>
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                        <span className="font-semibold text-slate-700 shrink-0">HP:</span>{' '}
                        <span className="font-mono text-slate-700 truncate">{record.phone || '-'}</span>
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 shrink-0 cursor-pointer"
                            title="Chat WhatsApp"
                          >
                            WA <Icon name="externalLink" size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Alamat Snippet Box */}
                  <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-100 text-[11px] text-slate-600 min-w-0 overflow-hidden">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <Icon name="pin" size={13} className="shrink-0 text-slate-400" />
                      <p className="truncate min-w-0 flex-1">
                        <strong className="text-slate-700">Alamat:</strong>{' '}
                        {record.address || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2 min-w-0 print:hidden">
                  <button
                    type="button"
                    onClick={() => onSelectDetail(record)}
                    className="flex-1 py-1.5 px-2.5 text-xs font-bold text-[#014181] bg-blue-50 hover:bg-[#014181] hover:text-white border border-blue-200/60 rounded-xl transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap min-w-0"
                  >
                    <Icon name="eye" size={14} />
                    <span>Detail</span>
                  </button>

                  {canManageRecord(record) && (
                    <button
                      type="button"
                      onClick={() => onStartEdit(record)}
                      className="flex-1 py-2 px-2.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap min-w-0"
                    >
                      <Icon name="edit" size={13} />
                      <span>Edit</span>
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onDeleteRecord(record.id, record.fullName)}
                      className="flex-1 py-2 px-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap min-w-0"
                      title="Hapus data ini"
                    >
                      <Icon name="trash" size={13} />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white/90 backdrop-blur-md rounded-3xl border border-dashed border-slate-300 p-6 space-y-3">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#014181] flex items-center justify-center text-3xl mx-auto">
            <Icon name="clipboard" size={22} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-700">
            {searchTerm || statusFilter !== 'ALL' || followUpFilter !== 'ALL' || reportTypeFilter !== 'ALL'
              ? 'Tidak ada data laporan yang cocok'
              : 'Belum Ada Laporan Tersimpan'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'ALL' || followUpFilter !== 'ALL' || reportTypeFilter !== 'ALL'
              ? 'Coba ganti kata kunci pencarian atau ubah filter status nasabah / tindak lanjut.'
              : 'Mulai dokumentasikan aktivitas transaksi nasabah Anda melalui formulir input.'}
          </p>
          {!isAllReports && (
            <button
              type="button"
              onClick={onOpenForm}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#014181] to-[#0A5AA3] hover:from-[#002D5B] hover:to-[#014181] rounded-xl transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center gap-2 mt-2"
            >
              <span>+ Input Laporan Sekarang</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

