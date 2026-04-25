import AddTransactionForm from '../components/AddTransactionForm';
import TransactionList from '../components/TransactionList';
import './PageStyles.css';
const Transactions = () => (
  <div className="page"><h1 className="page-heading">Transactions</h1><AddTransactionForm /><TransactionList /></div>
);
export default Transactions;
