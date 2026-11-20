export const MAX_SAVED_RECORDS = 50;

export const BLANK_FORM = {
  fullName: '',
  customerType: '',
  identityNumber: '',
  phone: '',
  address: '',
  transactionType: '',
  followUpStatus: '',
  followUp: '',
  photo: '',
  photoName: '',
};

export const FOLLOW_UP_STATUS_OPTIONS = [
  {
    value: 'pending',
    label: 'Perlu Ditindaklanjuti',
    hint: 'Keterangan rencana langkah berikutnya wajib diisi',
  },
  {
    value: 'done',
    label: 'Selesai',
    hint: 'Pekerjaan selesai; keterangan penyelesaian dapat dicatat',
  },
];

// Kolom opsional hasil migration tindak-lanjut.sql. Selama belum ada di
// database, aplikasi tetap berjalan dengan memuat/menyimpan kolom lama.
export const OPTIONAL_REPORT_COLUMNS = ['follow_up_status', 'tindak_lanjut_id'];

export function getStorageKey(userOrId, formType) {
  const id = typeof userOrId === 'string' ? userOrId : userOrId?.id;
  return `bri-app-records-${formType}-${id || 'guest'}`;
}

export function getFormTypeLabel(formType) {
  if (formType === 'rmkredit') return 'RM SME';
  return formType ? formType.toUpperCase() : 'RMFT';
}

export function readSavedRecords(userOrId, formType) {
  const userId = typeof userOrId === 'string' ? userOrId : userOrId?.id;
  try {
    const records = JSON.parse(localStorage.getItem(getStorageKey(userOrId, formType)) || '[]');
    return Array.isArray(records)
      ? records.map((record) => ({ ...record, userId: record.userId || userId }))
      : [];
  } catch {
    return [];
  }
}

export function writeSavedRecords(userOrId, formType, records) {
  try {
    localStorage.setItem(
      getStorageKey(userOrId, formType),
      JSON.stringify((records || []).slice(0, MAX_SAVED_RECORDS)),
    );
  } catch (err) {
    console.warn('Gagal menyimpan cache laporan di localStorage:', err);
  }
}

export function normalizeFollowUpStatus(status) {
  return status === 'done' ? 'done' : 'pending';
}

export function isMissingOptionalColumn(error) {
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  return OPTIONAL_REPORT_COLUMNS.some((column) => text.includes(column));
}

export function stripOptionalColumns(payload) {
  const next = { ...payload };
  OPTIONAL_REPORT_COLUMNS.forEach((column) => delete next[column]);
  return next;
}

export function isNetworkError(error) {
  const text = String(error?.message || '').toLowerCase();
  return (
    text.includes('failed to fetch') ||
    text.includes('fetch failed') ||
    text.includes('networkerror') ||
    text.includes('network request failed')
  );
}

export function formatWhatsAppUrl(phone) {
  const digits = String(phone || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `https://wa.me/62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `https://wa.me/62${digits}`;
  return `https://wa.me/${digits}`;
}

export function compressImageFile(file, { maxDim = 800, quality = 0.8 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('File foto tidak ditemukan.'));
      return;
    }
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih harus berupa gambar.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', quality),
          name: file.name,
        });
      };
      img.onerror = () => reject(new Error('Gagal memproses gambar. Coba file lain.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Foto tidak dapat dibaca. Coba file lain.'));
    reader.readAsDataURL(file);
  });
}

export function mapSupabaseReport(row, fallbackFormType) {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name || '',
    formType: row.form_type || fallbackFormType,
    fullName: row.full_name || '',
    customerType: row.customer_type || '',
    identityNumber: row.identity_number || '',
    phone: row.phone || '',
    address: row.address || '',
    transactionType: row.transaction_type || '',
    followUpStatus: normalizeFollowUpStatus(row.follow_up_status),
    followUp: row.follow_up || '',
    tindakLanjutId: row.tindak_lanjut_id || '',
    photo: row.photo_url || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

