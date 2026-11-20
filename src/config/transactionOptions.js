export const TRANSACTION_FORM_CONFIG = {
  rmft: {
    label: 'Jenis Transaksi',
    groups: [
      {
        label: 'Jenis Tabungan & Simpanan',
        options: [
          {
            value: 'Tabungan Perusahaan (Giro)',
            hint: 'Pembukaan atau layanan rekening giro perusahaan.',
          },
          {
            value: 'Deposito',
            hint: 'Penempatan, perpanjangan, atau konsultasi deposito berjangka.',
          },
          {
            value: 'Tabungan Biasa',
            hint: 'Pembukaan atau layanan rekening tabungan perorangan.',
          },
          {
            value: 'Simpanan',
            hint: 'Layanan produk simpanan dana nasabah.',
          },
        ],
      },
      {
        label: 'Merchant',
        options: [
          {
            value: 'Merchant - QRIS',
            hint: 'Pendaftaran, aktivasi, atau pemeliharaan QRIS merchant.',
          },
          {
            value: 'Merchant - EDC',
            hint: 'Pendaftaran, pemasangan, atau pemeliharaan mesin EDC (Electronic Data Capture).',
          },
        ],
      },
      {
        label: 'Transaksi & Layanan',
        options: [
          { value: 'Pembukaan rekening' },
          { value: 'Setoran' },
          { value: 'Tarikan' },
          { value: 'Transfer' },
          { value: 'Aktivasi layanan' },
          { value: 'Lainnya' },
        ],
      },
    ],
  },
  rmkredit: {
    label: 'Jenis Layanan Kredit',
    groups: [
      {
        label: 'Layanan Kredit SME',
        options: [
          { value: 'Konsultasi kredit' },
          { value: 'Pengajuan kredit' },
          {
            value: 'Analisa kredit',
            hint: 'Pengajuan kredit yang dianalisa terlebih dahulu untuk menilai kesanggupan bayar nasabah.',
          },
          { value: 'Follow up pengajuan' },
          { value: 'Pembayaran angsuran' },
          {
            value: 'Restrak kredit',
            hint: 'Restrukturisasi kredit (kredit dapat diperpanjang tenornya atau diperkecil plafon/angsurannya).',
          },
          { value: 'Lainnya' },
        ],
      },
    ],
  },
};

export function getTransactionGroups(formType, customOptions) {
  if (Array.isArray(customOptions) && customOptions.length > 0) {
    return [
      {
        label: '',
        options: customOptions.map((item) => (typeof item === 'string' ? { value: item } : item)),
      },
    ];
  }

  return TRANSACTION_FORM_CONFIG[formType]?.groups || TRANSACTION_FORM_CONFIG.rmft.groups;
}

export function getTransactionHint(formType, value, customOptions) {
  if (!value) return '';
  const groups = getTransactionGroups(formType, customOptions);
  for (const group of groups) {
    const match = group.options.find((opt) => opt.value === value);
    if (match?.hint) return match.hint;
  }
  return '';
}

export function hasTransactionOption(groups, value) {
  if (!value) return true;
  return groups.some((group) => group.options.some((opt) => opt.value === value));
}

