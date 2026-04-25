import BudgetForm from '../components/BudgetForm';
import BudgetProgress from '../components/BudgetProgress';
import './PageStyles.css';
const Budget = () => (
  <div className="page"><h1 className="page-heading">Budget Planner</h1><BudgetForm /><BudgetProgress /></div>
);
export default Budget;
