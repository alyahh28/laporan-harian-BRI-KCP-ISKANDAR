import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabaseClient.js';
import { recordActivity } from '../pages/auth/activityLog.js';
import { isAdminRole } from '../config/rolesConfig.jsx';
import {
  setReportTaskLink,
  syncTaskFromEditedReport,
  syncTaskWithReport,
  TASK_STATUS,
} from '../services/tindakLanjut.js';
import Icon from './Icon.jsx';
import PhotoLightbox from './reports/PhotoLightbox.jsx';
import ReportDetailModal from './reports/ReportDetailModal.jsx';
import ReportEditModal from './reports/ReportEditModal.jsx';
import ReportInputForm from './reports/ReportInputForm.jsx';
import ReportListView from './reports/ReportListView.jsx';
import {
  BLANK_FORM,
  compressImageFile,
  getFormTypeLabel,
  isMissingOptionalColumn,
  isNetworkError,
  MAX_SAVED_RECORDS,
  mapSupabaseReport,
  normalizeFollowUpStatus,
  readSavedRecords,
  stripOptionalColumns,
  writeSavedRecords,
} from './reports/reportUtils.js';

export default function TransactionForm({
  user,
  onBack,
  formType,
  title,
  transactionLabel,
  transactionOptions,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const userId = user?.id;
  const userRole = user?.role;
  const isAdmin = isAdminRole(userRole);
  const isAllReports = isAdmin && searchParams.get('scope') === 'all';
  const viewMode = isAllReports || searchParams.get('view') === 'reports' ? 'reports' : 'form';
  const returnToDashboard = location.state?.returnToDashboard === true;

  const [linkedTask, setLinkedTask] = useState(() => location.state?.prefillTask || null);
  const [form, setForm] = useState(() => {
    const task = location.state?.prefillTask;
    if (!task) return BLANK_FORM;
    return {
      ...BLANK_FORM,
      fullName: task.customerName || '',
      customerType: task.customerType || '',
      identityNumber: task.customerIdentity || '',
      phone: task.phone || '',
      transactionType: task.activity || '',
    };
  });
  const [records, setRecords] = useState(() => readSavedRecords(userId, isAllReports ? 'all' : formType));
  const [selectedDetailRecord, setSelectedDetailRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editError, setEditError] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingSaving, setIsEditingSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [followUpFilter, setFollowUpFilter] = useState('ALL');
  const [reportTypeFilter, setReportTypeFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [reportsLoadError, setReportsLoadError] = useState('');
  const submitLockRef = useRef(false);

  const switchViewMode = (nextMode) => {
    if (nextMode === 'reports') {
      setSearchParams({ view: 'reports' });
      return;
    }
    setSearchParams({});
  };

  // Ambil laporan dari Supabase; halaman admin gabungan memuat kedua jenis laporan.
  useEffect(() => {
    // level 0 = kolom lama, 1 = +follow_up_status, 2 = +tindak_lanjut_id
    const reportColumns = (level) => [
      'id', 'user_id', 'user_name', 'form_type', 'full_name', 'customer_type',
      'identity_number', 'phone', 'address', 'transaction_type', 'follow_up',
      ...(level >= 1 ? ['follow_up_status'] : []),
      ...(level >= 2 ? ['tindak_lanjut_id'] : []),
      'photo_url', 'created_at',
    ].join(', ');

    let isMounted = true;

    async function fetchReports() {
      if (!userId) return;
      setIsLoadingReports(true);
      setReportsLoadError('');
      try {
        let data = [];
        if (isAllReports) {
          const loadAllPages = async (level) => {
            const pageSize = 1000;
            const rows = [];
            for (let offset = 0; ; offset += pageSize) {
              const { data: page, error } = await supabase
                .from('laporan_rm')
                .select(reportColumns(level))
                .in('form_type', ['rmft', 'rmkredit'])
                .order('created_at', { ascending: false })
                .order('id', { ascending: true })
                .range(offset, offset + pageSize - 1);
              if (error) return { data: null, error };
              rows.push(...(page || []));
              if (!page || page.length < pageSize) return { data: rows, error: null };
            }
          };

          let result = await loadAllPages(2);
          // Turunkan level kolom bila migration terbaru belum dijalankan,
          // agar laporan lama tetap tampil.
          for (const level of [1, 0]) {
            if (!result.error || !isMissingOptionalColumn(result.error)) break;
            result = await loadAllPages(level);
          }
          if (result.error) throw result.error;
          data = result.data || [];
        } else {
          let reportQuery = supabase
            .from('laporan_rm')
            .select('*')
            .eq('form_type', formType);
          if (!isAdminRole(userRole)) {
            reportQuery = reportQuery.eq('user_id', userId);
          }
          const { data: page, error } = await reportQuery
            .order('created_at', { ascending: false })
            .limit(100);
          if (error) throw error;
          data = page || [];
        }

        if (!isMounted) return;
        const mapped = data.map((row) => mapSupabaseReport(row, formType));
        setRecords(mapped);
        if (!isAllReports) {
          writeSavedRecords(userId, formType, mapped);
        }
      } catch (err) {
        console.error('Gagal memuat laporan Supabase:', err);
        if (isMounted) {
          setReportsLoadError('Laporan belum dapat dimuat dari server. Periksa koneksi lalu coba lagi.');
        }
      } finally {
        if (isMounted) setIsLoadingReports(false);
      }
    }

    fetchReports();
    return () => {
      isMounted = false;
    };
  }, [userId, userRole, formType, isAllReports]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setMessage({ text: '', type: '' });
  };

  const handleFollowUpStatusChange = (event) => {
    const { value } = event.target;
    setForm((current) => ({
      ...current,
      followUpStatus: value,
    }));
    setMessage({ text: '', type: '' });
  };

  const updateEditingField = (event) => {
    const { name, value } = event.target;
    setEditingRecord((current) => ({ ...current, [name]: value }));
    setEditError('');
  };

  const handleEditingFollowUpStatusChange = (event) => {
    const { value } = event.target;
    setEditingRecord((current) => ({
      ...current,
      followUpStatus: value,
    }));
    setEditError('');
  };

  const canManageRecord = (record) =>
    isAdmin || (Boolean(userId) && record.userId === userId);

  const startEditingRecord = (record) => {
    setEditError('');
    setEditingRecord({
      ...record,
      followUpStatus: normalizeFollowUpStatus(record.followUpStatus),
      followUp: record.followUp || '',
    });
  };

  const clearRouterTaskState = () => {
    if (location.state) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  };

  const handleUnlinkTask = () => {
    setLinkedTask(null);
    clearRouterTaskState();
  };

  const handleResetForm = () => {
    setForm(BLANK_FORM);
    setLinkedTask(null);
    setMessage({ text: '', type: '' });
    clearRouterTaskState();
  };

  const handlePhotoChange = async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

    try {
      const { dataUrl, name } = await compressImageFile(file);
      setForm((current) => ({
        ...current,
        photo: dataUrl,
        photoName: name,
      }));
      setMessage({ text: 'Foto berhasil dimuat dan dioptimalkan.', type: 'info' });
    } catch (err) {
      setMessage({ text: err?.message || 'Foto tidak dapat diproses.', type: 'error' });
    }
  };

  const handleEditingPhotoChange = async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

    try {
      const { dataUrl } = await compressImageFile(file);
      setEditingRecord((current) => ({
        ...current,
        photo: dataUrl,
      }));
      setEditError('');
    } catch (err) {
      setEditError(err?.message || 'Foto tidak dapat diproses.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitLockRef.current) return;

    if (!form.followUpStatus) {
      setMessage({ text: 'Pilih status tindak lanjut terlebih dahulu.', type: 'error' });
      return;
    }
    if (form.followUpStatus === 'pending' && !form.followUp.trim()) {
      setMessage({
        text: 'Keterangan tindak lanjut (rencana langkah berikutnya) wajib diisi jika status "Perlu Ditindaklanjuti".',
        type: 'error',
      });
      return;
    }

    if (linkedTask && form.followUpStatus === TASK_STATUS.DONE) {
      const confirmed = window.confirm(
        `Laporan ini akan menutup tugas tindak lanjut "${linkedTask.activity || 'pekerjaan'}" `
        + `milik ${linkedTask.customerName}. Lanjutkan?`,
      );
      if (!confirmed) return;
    }

    submitLockRef.current = true;
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    const record = {
      ...form,
      id: crypto.randomUUID(),
      userId: userId || null,
      userName: user?.name || '',
      formType,
      createdAt: new Date().toISOString(),
    };

    let savedId = record.id;
    let savedCreatedAt = record.createdAt;
    let reportPersisted = false;
    let offlineSaved = false;
    let taskSyncNote = '';

    try {
      const payload = {
        id: record.id,
        user_id: userId || null,
        user_name: user?.name || 'Pegawai',
        form_type: formType,
        full_name: form.fullName.trim(),
        customer_type: form.customerType,
        identity_number: form.identityNumber.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        transaction_type: form.transactionType,
        follow_up_status: form.followUpStatus,
        follow_up: form.followUp.trim(),
        photo_url: form.photo,
      };

      let { data: dbData, error: dbError } = await supabase
        .from('laporan_rm')
        .insert(payload)
        .select()
        .single();

      if (dbError && isMissingOptionalColumn(dbError)) {
        ({ data: dbData, error: dbError } = await supabase
          .from('laporan_rm')
          .insert(stripOptionalColumns(payload))
          .select()
          .single());
      }

      if (dbError) {
        if (!isNetworkError(dbError)) {
          setMessage({
            text: `Gagal menyimpan laporan ke server: ${dbError.message}`,
            type: 'error',
          });
          return;
        }
        offlineSaved = true;
        console.warn('Supabase tidak terjangkau, menyimpan laporan ke cache lokal:', dbError.message);
      } else if (dbData) {
        savedId = dbData.id;
        savedCreatedAt = dbData.created_at;
        reportPersisted = true;
      }

      if (reportPersisted) {
        try {
          const { taskId, error } = await syncTaskWithReport({
            user,
            form,
            formType,
            reportId: savedId,
            linkedTask,
          });

          if (error) {
            taskSyncNote = ' Laporan tersimpan, namun tugas tindak lanjut gagal disinkronkan.';
            console.warn('Sinkronisasi tugas tindak lanjut:', error.message);
          } else if (taskId) {
            await setReportTaskLink(savedId, taskId);
            record.tindakLanjutId = taskId;
          }
        } catch (taskErr) {
          console.warn('Sinkronisasi tugas tindak lanjut error:', taskErr);
          taskSyncNote = ' Laporan tersimpan, namun tugas tindak lanjut gagal disinkronkan.';
        }
      }

      const nextRecord = {
        ...record,
        id: savedId,
        createdAt: savedCreatedAt,
      };
      const nextRecords = [nextRecord, ...records.filter((r) => r.id !== savedId)].slice(
        0,
        MAX_SAVED_RECORDS,
      );
      writeSavedRecords(userId, formType, nextRecords);
      setRecords(nextRecords);

      recordActivity(
        user,
        `Upload ${getFormTypeLabel(formType)}`,
        `Mengunggah laporan ${form.fullName} - ${form.transactionType}`,
      );
      setForm(BLANK_FORM);
      setLinkedTask(null);
      clearRouterTaskState();
      setMessage(
        offlineSaved
          ? {
            text: 'Koneksi sedang offline. Laporan disimpan sementara di perangkat ini.',
            type: 'info',
          }
          : {
            text: `Data laporan berhasil diupload!${taskSyncNote}`,
            type: taskSyncNote ? 'info' : 'success',
          },
      );
    } catch (dbErr) {
      if (!isNetworkError(dbErr)) {
        setMessage({
          text: `Gagal menyimpan laporan: ${dbErr?.message || 'Terjadi kesalahan.'}`,
          type: 'error',
        });
        return;
      }
      console.warn('Supabase offline/error, menyimpan lokal:', dbErr);
      const nextRecords = [record, ...records.filter((r) => r.id !== record.id)].slice(
        0,
        MAX_SAVED_RECORDS,
      );
      writeSavedRecords(userId, formType, nextRecords);
      setRecords(nextRecords);
      setForm(BLANK_FORM);
      setLinkedTask(null);
      clearRouterTaskState();
      setMessage({
        text: 'Koneksi sedang offline. Laporan disimpan sementara di perangkat ini.',
        type: 'info',
      });
    } finally {
      setIsSaving(false);
      submitLockRef.current = false;
    }
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (!editingRecord || !canManageRecord(editingRecord)) return;

    if (!editingRecord.followUpStatus) {
      setEditError('Pilih status tindak lanjut terlebih dahulu.');
      return;
    }
    if (editingRecord.followUpStatus === 'pending' && !(editingRecord.followUp || '').trim()) {
      setEditError(
        'Keterangan tindak lanjut (rencana langkah berikutnya) wajib diisi jika status "Perlu Ditindaklanjuti".',
      );
      return;
    }

    if (editingRecord.tindakLanjutId && editingRecord.followUpStatus === TASK_STATUS.DONE) {
      const confirmed = window.confirm(
        'Menyimpan perubahan ini akan menandai tugas tindak lanjut terkait sebagai selesai. Lanjutkan?',
      );
      if (!confirmed) return;
    }

    setEditError('');
    setIsEditingSaving(true);
    let editSyncNote = '';

    try {
      const payload = {
        full_name: editingRecord.fullName.trim(),
        customer_type: editingRecord.customerType,
        identity_number: editingRecord.identityNumber.trim(),
        phone: editingRecord.phone.trim(),
        address: editingRecord.address.trim(),
        transaction_type: editingRecord.transactionType,
        follow_up_status: editingRecord.followUpStatus,
        follow_up: (editingRecord.followUp || '').trim(),
        photo_url: editingRecord.photo,
      };

      let updateQuery = supabase
        .from('laporan_rm')
        .update(payload)
        .eq('id', editingRecord.id);

      if (userId && !isAdmin) {
        updateQuery = updateQuery.eq('user_id', userId);
      }
      let { error: dbError } = await updateQuery;

      if (dbError && isMissingOptionalColumn(dbError)) {
        let legacyQuery = supabase
          .from('laporan_rm')
          .update(stripOptionalColumns(payload))
          .eq('id', editingRecord.id);
        if (userId && !isAdmin) {
          legacyQuery = legacyQuery.eq('user_id', userId);
        }
        ({ error: dbError } = await legacyQuery);
      }

      if (dbError) {
        setEditError(`Perubahan gagal disimpan ke server: ${dbError.message}`);
        return;
      }

      if (editingRecord.tindakLanjutId) {
        try {
          const { error: taskError } = await syncTaskFromEditedReport({
            user,
            taskId: editingRecord.tindakLanjutId,
            form: editingRecord,
            formType: editingRecord.formType || formType,
            reportId: editingRecord.id,
          });
          if (taskError) {
            console.warn('Sinkronisasi tugas setelah edit:', taskError.message);
            editSyncNote = ' Tugas tindak lanjut gagal disinkronkan.';
          }
        } catch (taskErr) {
          console.warn('Sinkronisasi tugas setelah edit error:', taskErr);
          editSyncNote = ' Tugas tindak lanjut gagal disinkronkan.';
        }
      }

      const updatedRecords = records.map((r) =>
        r.id === editingRecord.id ? { ...editingRecord } : r,
      );
      setRecords(updatedRecords);
      if (!isAllReports) {
        writeSavedRecords(userId, formType, updatedRecords);
      }

      if (selectedDetailRecord && selectedDetailRecord.id === editingRecord.id) {
        setSelectedDetailRecord({ ...editingRecord });
      }

      recordActivity(
        user,
        `Edit ${getFormTypeLabel(editingRecord.formType || formType)}`,
        `Memperbarui data laporan ${editingRecord.fullName}`,
      );

      setEditingRecord(null);
      setEditError('');
      setMessage({
        text: `Data laporan berhasil diperbarui.${editSyncNote}`,
        type: editSyncNote ? 'info' : 'success',
      });
    } catch (err) {
      setEditError(`Perubahan gagal disimpan: ${err?.message || 'Periksa koneksi Anda.'}`);
    } finally {
      setIsEditingSaving(false);
    }
  };

  const handleDeleteRecord = async (recordId, recordName = '') => {
    const recordToDelete = records.find((record) => record.id === recordId);
    if (!recordToDelete || !canManageRecord(recordToDelete)) return;

    if (
      !window.confirm(
        `Yakin ingin menghapus laporan nasabah ${recordName || 'ini'}? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }

    setReportsLoadError('');

    try {
      let deleteQuery = supabase.from('laporan_rm').delete().eq('id', recordId);
      if (userId && !isAdmin) {
        deleteQuery = deleteQuery.eq('user_id', userId);
      }
      const { error } = await deleteQuery;
      if (error) {
        setReportsLoadError(`Laporan gagal dihapus dari server: ${error.message}`);
        return;
      }
    } catch (err) {
      setReportsLoadError(`Laporan gagal dihapus: ${err?.message || 'Periksa koneksi Anda.'}`);
      return;
    }

    const updated = records.filter((r) => r.id !== recordId);
    setRecords(updated);
    if (!isAllReports) {
      writeSavedRecords(userId, formType, updated);
    }

    if (selectedDetailRecord?.id === recordId) {
      setSelectedDetailRecord(null);
    }

    recordActivity(
      user,
      `Hapus ${getFormTypeLabel(recordToDelete.formType || formType)}`,
      `Menghapus data laporan ${recordName}`,
    );
  };

  const sortedRecords = useMemo(() => {
    const visibleRecords = isAdmin
      ? records
      : records.filter((record) => record.userId === userId);
    return [...visibleRecords].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );
  }, [records, isAdmin, userId]);

  const filteredRecords = useMemo(() => {
    let result = sortedRecords;

    if (statusFilter !== 'ALL') {
      result = result.filter((r) => r.customerType === statusFilter);
    }

    if (followUpFilter !== 'ALL') {
      result = result.filter(
        (r) => normalizeFollowUpStatus(r.followUpStatus) === followUpFilter,
      );
    }

    if (isAllReports && reportTypeFilter !== 'ALL') {
      result = result.filter((record) => record.formType === reportTypeFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.fullName?.toLowerCase().includes(q) ||
          r.transactionType?.toLowerCase().includes(q) ||
          r.identityNumber?.toLowerCase().includes(q) ||
          r.phone?.toLowerCase().includes(q) ||
          r.address?.toLowerCase().includes(q) ||
          r.followUp?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [sortedRecords, searchTerm, statusFilter, followUpFilter, reportTypeFilter, isAllReports]);

  const followUpCounts = useMemo(() => {
    const pending = sortedRecords.filter(
      (record) => normalizeFollowUpStatus(record.followUpStatus) === 'pending',
    ).length;
    return { pending, done: sortedRecords.length - pending };
  }, [sortedRecords]);

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <main className="relative min-h-screen font-sans text-slate-800 pb-16 overflow-x-hidden bg-[#C9DCEF]">
      {/* Background Decor Layer - Serasi dengan Home */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden print:hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C9DCEF] via-[#A9C6E5] to-[#C9DCEF]" />

        <div
          className="absolute top-16 right-10 w-72 h-72 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(1, 65, 129, 0.3) 1.5px, transparent 1.5px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div
          className="absolute bottom-20 left-10 w-64 h-64 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255, 116, 1, 0.35) 1.5px, transparent 1.5px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#014181]/25 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] rounded-full bg-[#FF7401]/20 blur-[110px]" />
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] rounded-full bg-[#0A5AA3]/20 blur-[130px]" />
      </div>

      <div className="relative z-10">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/90 border-b border-slate-200/70 shadow-xs transition-all duration-300 print:hidden">
          <div className="h-1 bg-[#FF7401] w-full" />
          <div
            className={`${
              viewMode === 'reports'
                ? 'mx-auto w-full max-w-7xl px-4 sm:px-8'
                : 'max-w-4xl mx-auto px-3.5 sm:px-6'
            } py-2.5 sm:py-3 flex items-center justify-between gap-2`}
          >
            {/* Tombol Kembali / Navigasi View */}
            {viewMode === 'reports' ? (
              <button
                type="button"
                onClick={() => (
                  isAllReports || returnToDashboard ? onBack() : switchViewMode('form')
                )}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 text-[#014181] text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer group"
                title={
                  isAllReports || returnToDashboard
                    ? 'Kembali ke dashboard'
                    : 'Kembali ke Formulir Input'
                }
              >
                <svg
                  className="w-4 h-4 text-[#014181] group-hover:-translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>
                  {isAllReports || returnToDashboard
                    ? isAllReports ? 'Dashboard Admin' : 'Dashboard'
                    : 'Formulir Input'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 text-[#014181] text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer group"
                title="Kembali ke Beranda"
              >
                <svg
                  className="w-4 h-4 text-[#014181] group-hover:-translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Beranda</span>
              </button>
            )}

            {/* Toggle View & User Profile */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/tindak-lanjut')}
                className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-3 rounded-full border border-[#FF7401]/40 bg-[#FF7401]/10 text-[11px] font-bold text-[#B34A02] hover:bg-[#FF7401]/20 active:scale-95 transition-all cursor-pointer"
                title="Buka menu Tindak Lanjut"
              >
                <Icon name="target" size={14} />
                <span className="hidden sm:inline">Tindak Lanjut</span>
              </button>

              {/* User Profile Pill */}
              <div className="flex items-center h-9 sm:h-10 gap-2 p-1 pr-3 rounded-full border border-slate-200/80 bg-white shadow-xs">
                <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#014181] text-white text-xs font-bold ring-2 ring-[#FF7401]/40 overflow-hidden shrink-0">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt={user?.name || 'Foto'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.slice(0, 2).toUpperCase() || 'RM'
                  )}
                </span>
                <span className="text-xs font-bold text-[#014181] max-w-[90px] sm:max-w-none truncate hidden sm:inline">
                  {user?.name || 'Insan BRILiaN'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {viewMode === 'reports' ? (
          <ReportListView
            formType={formType}
            title={title}
            isAllReports={isAllReports}
            isAdmin={isAdmin}
            sortedRecords={sortedRecords}
            filteredRecords={filteredRecords}
            followUpCounts={followUpCounts}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            followUpFilter={followUpFilter}
            reportTypeFilter={reportTypeFilter}
            reportsLoadError={reportsLoadError}
            isLoadingReports={isLoadingReports}
            canManageRecord={canManageRecord}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onFollowUpFilterChange={setFollowUpFilter}
            onReportTypeFilterChange={setReportTypeFilter}
            onOpenForm={() => switchViewMode('form')}
            onSelectDetail={setSelectedDetailRecord}
            onStartEdit={startEditingRecord}
            onDeleteRecord={handleDeleteRecord}
            onPreviewPhoto={setPreviewPhoto}
          />
        ) : (
          <ReportInputForm
            formType={formType}
            title={title}
            transactionLabel={transactionLabel}
            transactionOptions={transactionOptions}
            form={form}
            recordsCount={records.length}
            linkedTask={linkedTask}
            message={message}
            isSaving={isSaving}
            onFieldChange={updateField}
            onFollowUpStatusChange={handleFollowUpStatusChange}
            onPhotoChange={handlePhotoChange}
            onRemovePhoto={() => setForm((current) => ({ ...current, photo: '', photoName: '' }))}
            onPreviewPhoto={setPreviewPhoto}
            onUnlinkTask={handleUnlinkTask}
            onReset={handleResetForm}
            onSubmit={handleSubmit}
            onOpenReports={() => switchViewMode('reports')}
          />
        )}
      </div>

      <ReportDetailModal
        record={selectedDetailRecord}
        formType={formType}
        user={user}
        isAdmin={isAdmin}
        copiedId={copiedId}
        canManage={selectedDetailRecord ? canManageRecord(selectedDetailRecord) : false}
        onCopyIdentity={copyToClipboard}
        onEdit={startEditingRecord}
        onDelete={handleDeleteRecord}
        onPreviewPhoto={setPreviewPhoto}
        onClose={() => setSelectedDetailRecord(null)}
      />

      <ReportEditModal
        editingRecord={editingRecord}
        fallbackFormType={formType}
        customOptions={transactionOptions}
        editError={editError}
        isSaving={isEditingSaving}
        onFieldChange={updateEditingField}
        onFollowUpStatusChange={handleEditingFollowUpStatusChange}
        onPhotoChange={handleEditingPhotoChange}
        onRemovePhoto={() => setEditingRecord((curr) => ({ ...curr, photo: '' }))}
        onSave={handleSaveEdit}
        onClose={() => {
          setEditingRecord(null);
          setEditError('');
        }}
      />

      <PhotoLightbox
        photoSrc={previewPhoto}
        onClose={() => setPreviewPhoto(null)}
      />
    </main>
  );
}
