import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/auth';
import { 
  User, Mail, Phone, MapPin, Calendar, Droplet, 
  Save, ArrowLeft, Shield, Key, Download, FileText,
  Camera, AlertCircle, CheckCircle, Loader
} from 'lucide-react';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    dateOfBirth: '',
    bloodGroup: '',
    profilePicture: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      const userData = response.data.data.user;
      
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || { street: '', city: '', state: '', zipCode: '' },
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
        bloodGroup: userData.bloodGroup || '',
        profilePicture: userData.profilePicture || ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Sanitization
    if (name === 'name') {
      // Allow alphabets, spaces, and hyphens
      value = value.replace(/[^a-zA-Z\s-]/g, '');
    }
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      
      if (addressField === 'city' || addressField === 'state') {
        value = value.replace(/[^a-zA-Z\s]/g, '');
      }
      if (addressField === 'zipCode') {
        value = value.replace(/\D/g, '').slice(0, 6);
      }

      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    // Age validation (0-120)
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 0 || age > 120) {
        setMessage({ type: 'error', text: 'Age must be between 0 and 120 years' });
        setSaving(false);
        return;
      }
    }

    try {
      const response = await api.put('/auth/profile', formData);
      
      // Update user context
      const updatedUser = { ...user, ...response.data.data.user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update password' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async (format) => {
    try {
      setMessage({ type: 'info', text: `Preparing ${format === 'pdf' ? 'text document' : format.toUpperCase()} export...` });
      
      const response = await api.get(`/auth/export-data?format=${format}`, {
        responseType: 'blob'
      });
      
      // Determine file extension (PDF is actually a text file)
      const fileExtension = format === 'pdf' ? 'txt' : format;
      const fileName = `thalai-medical-records-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: `Medical records exported successfully as ${fileExtension.toUpperCase()}!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'Export failed. Please try again.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent font-body pb-32 animate-reveal">
      {/* Header */}
      <div className="glass border-b border-slate-100 relative z-40">
        <div className="container-custom py-6 md:py-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/${user?.role}-dashboard`)} 
              className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  User Control Panel
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-black text-slate-900 tracking-tight">
                Account <span className="text-sky-500">Settings</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 md:py-10">
        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-reveal ${
            message.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
            message.type === 'error' ? 'bg-rose-50 border border-rose-100 text-rose-700' :
            'bg-sky-50 border border-sky-100 text-sky-700'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm tracking-tight">{message.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile Info', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'data', label: 'Data Export', icon: Download }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="card-premium">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest">
                  <Droplet className="w-4 h-4" />
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  required
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest">
                  <MapPin className="w-4 h-4" />
                  Residency Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      placeholder="Street Address"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                  </div>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    placeholder="ZIP Code"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-black uppercase tracking-widest text-sm"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordUpdate} className="card-premium">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest">
                  <Key className="w-4 h-4" />
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest">
                  <Key className="w-4 h-4" />
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  required
                  minLength={6}
                />
                <p className="text-xs text-slate-400 font-medium">Minimum 6 characters</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest">
                  <Key className="w-4 h-4" />
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-black uppercase tracking-widest text-sm"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}

        {/* Data Export Tab */}
        {activeTab === 'data' && (
          <div className="card-premium">
            <div className="mb-6">
              <h3 className="text-xl font-display font-black text-slate-900 mb-2">Export Your Medical Data</h3>
              <p className="text-sm text-slate-500 font-medium">Download your complete medical records and transfusion history in your preferred format.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => handleExportData('pdf')}
                className="p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-sky-500 hover:bg-sky-50 transition-all group"
              >
                <FileText className="w-12 h-12 text-slate-300 group-hover:text-sky-500 mb-4 transition-colors" />
                <h4 className="text-lg font-black text-slate-900 mb-1">Text Document</h4>
                <p className="text-xs text-slate-400 font-medium">Formatted medical records (TXT)</p>
              </button>

              <button
                onClick={() => handleExportData('csv')}
                className="p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
              >
                <Download className="w-12 h-12 text-slate-300 group-hover:text-emerald-500 mb-4 transition-colors" />
                <h4 className="text-lg font-black text-slate-900 mb-1">CSV Data</h4>
                <p className="text-xs text-slate-400 font-medium">Spreadsheet-compatible data export</p>
              </button>
            </div>

            <div className="mt-6 p-4 bg-sky-50 border border-sky-100 rounded-xl">
              <p className="text-xs text-sky-700 font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Your data export includes all medical reports, transfusion history, and health metrics. This data is encrypted and for your personal use only.</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;
