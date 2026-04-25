import { useNavigate } from 'react-router-dom';
import './PageStyles.css';
const NotFound = () => { const nav=useNavigate(); return <div className="page" style={{textAlign:'center',paddingTop:'80px'}}><h1 style={{fontSize:'64px',color:'#e5e7eb',fontWeight:700}}>404</h1><p style={{fontSize:'18px',color:'#6b7280',margin:'12px 0 24px'}}>Page not found</p><button onClick={()=>nav('/')} style={{padding:'12px 28px',background:'#3b82f6',color:'#fff',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:600,cursor:'pointer'}}>Go to Dashboard</button></div>; };
export default NotFound;
