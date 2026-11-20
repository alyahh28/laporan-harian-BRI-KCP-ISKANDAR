import TransactionForm from '../../components/TransactionForm.jsx';
import { TRANSACTION_FORM_CONFIG } from '../../config/transactionOptions.js';

export default function RMFT({ user, onBack }) {
  return (
    <TransactionForm
      user={user}
      onBack={onBack}
      formType="rmft"
      title="Relationship Manager Funding & Transaksi (RMFT)"
      transactionLabel={TRANSACTION_FORM_CONFIG.rmft.label}
    />
  );
}
