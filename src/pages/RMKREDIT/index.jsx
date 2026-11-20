import TransactionForm from '../../components/TransactionForm.jsx';
import { TRANSACTION_FORM_CONFIG } from '../../config/transactionOptions.js';

export default function RMKREDIT({ user, onBack }) {
  return (
    <TransactionForm
      user={user}
      onBack={onBack}
      formType="rmkredit"
      title="Relationship Manager SME"
      transactionLabel={TRANSACTION_FORM_CONFIG.rmkredit.label}
    />
  );
}
