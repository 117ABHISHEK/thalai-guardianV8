import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, toggleUserStatus, deleteUser } from '../api/admin';
import { 
  Users, ShieldAlert, UserX, UserCheck, Trash2, 
  Search, Filter, ShieldCheck, Mail, Tag,
  ArrowLeft, Settings, ShieldOff, AlertTriangle
} from 'lucide-react';

const SystemSettings = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data.users);
    } catch (err) {
      setError(err.message || 'Failed to sync user database');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    if (!window.confirm('Are you sure you want to modify this account status?')) return;
    try {
      await toggleUserStatus(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
       alert(err.message || 'Status transition failed');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('CRITICAL ACTION: This will permanently delete the user and all associated medical data. Continue?')) return;
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
       alert(err.message || 'Deactivation protocol failed');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' ? user.isActive : !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent font-body pb-32 animate-reveal">
      {/* Header Section */}
      <div className="glass border-b border-slate-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <button onClick={() => navigate('/admin-dashboard')} className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">
                    <ArrowLeft className="w-5 h-5 text-slate-400" />
                 </button>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                       <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                         Governance Control
                       </span>
                    </div>
                    <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">
                      System <span className="text-sky-500">Settings</span>
                    </h1>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <div className="bg-white border border-slate-200 rounded-[24px] px-4 py-2 flex items-center gap-3 w-full md:w-64 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search accounts..." 
                      className="bg-transparent border-none outline-none text-sm font-medium w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 flex items-center gap-3 animate-reveal">
             <AlertTriangle className="w-5 h-5" />
             <span className="font-bold text-sm">{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
           <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-2xl">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                className="bg-transparent text-xs font-black uppercase tracking-widest outline-none"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                 <option value="all">All Roles</option>
                 <option value="doctor">Doctors</option>
                 <option value="donor">Donors</option>
                 <option value="patient">Patients</option>
              </select>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-2xl">
              <div className={`w-2 h-2 rounded-full ${statusFilter === 'active' ? 'bg-emerald-500' : statusFilter === 'blocked' ? 'bg-rose-500' : 'bg-slate-300'}`} />
              <select 
                className="bg-transparent text-xs font-black uppercase tracking-widest outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                 <option value="all">Any Status</option>
                 <option value="active">Active Only</option>
                 <option value="blocked">Blocked Only</option>
              </select>
           </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredUsers.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-white rounded-[48px] border border-dashed border-slate-200">
                <Users className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No matching accounts found in registry</p>
             </div>
           ) : (
             filteredUsers.map((u) => (
               <div key={u._id} className="card-premium group hover:border-sky-200 transition-all overflow-hidden relative">
                  <div className={`absolute top-0 right-0 p-4 ${u.isActive ? 'text-emerald-100' : 'text-rose-100'} opacity-10 group-hover:scale-150 transition-transform duration-700`}>
                     {u.role === 'doctor' ? <ShieldCheck className="w-24 h-24" /> : u.role === 'donor' ? <Tag className="w-24 h-24" /> : <Users className="w-24 h-24" />}
                  </div>

                  <div className="flex justify-between items-start mb-6">
                     <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        u.role === 'doctor' ? 'bg-indigo-50 text-indigo-600' : 
                        u.role === 'donor' ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'
                     }`}>
                        {u.role} Node
                     </div>
                     <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                     }`}>
                        {u.isActive ? 'Network Online' : 'Access Restricted'}
                     </span>
                  </div>

                  <div className="mb-6">
                     <h3 className="text-xl font-display font-black text-slate-900 line-clamp-1">{u.name}</h3>
                     <div className="flex items-center gap-2 text-slate-400 mt-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium truncate">{u.email}</span>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex gap-3">
                     <button 
                       onClick={() => handleToggleStatus(u._id)}
                       className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                         u.isActive 
                         ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                         : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                       }`}
                     >
                        {u.isActive ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        {u.isActive ? 'Block Temp' : 'Activate'}
                     </button>
                     <button 
                       onClick={() => handleDeleteUser(u._id)}
                       className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
                       title="Delete Permanently"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
