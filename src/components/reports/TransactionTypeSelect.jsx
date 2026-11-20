import {
  getTransactionGroups,
  getTransactionHint,
  hasTransactionOption,
} from '../../config/transactionOptions.js';

export default function TransactionTypeSelect({
  formType,
  label = 'Jenis Transaksi',
  name = 'transactionType',
  value,
  onChange,
  customOptions,
  placeholder,
  required = true,
  className = '',
}) {
  const groups = getTransactionGroups(formType, customOptions);
  const useGroups = groups.length > 1 || Boolean(groups[0]?.label);
  const showLegacyOption = Boolean(value) && !hasTransactionOption(groups, value);
  const hint = getTransactionHint(formType, value, customOptions);

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={
          className
          || 'w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#014181]/20 focus:border-[#014181] text-slate-800 transition-all'
        }
      >
        <option value="" disabled>
          {placeholder || `Pilih ${label.toLowerCase()}`}
        </option>
        {showLegacyOption && (
          <option value={value}>{value}</option>
        )}
        {useGroups
          ? groups.map((group) => (
            <optgroup key={group.label || 'default'} label={group.label || 'Pilihan'}>
              {group.options.map((opt) => (
                <option value={opt.value} key={opt.value}>
                  {opt.value}
                </option>
              ))}
            </optgroup>
          ))
          : groups[0]?.options.map((opt) => (
            <option value={opt.value} key={opt.value}>
              {opt.value}
            </option>
          ))}
      </select>
      {hint && (
        <p className="text-[10px] font-medium text-[#014181]/80">{hint}</p>
      )}
    </div>
  );
}

