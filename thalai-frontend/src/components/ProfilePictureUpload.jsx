import { useState } from 'react';
import { Camera, User } from 'lucide-react';
import { updateProfile } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const ProfilePictureUpload = ({ size = 'w-32 h-32' }) => {
  const { user, updateUser } = useAuth();
  const [updating, setUpdating] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        try {
          setUpdating(true);
          const response = await updateProfile({ profilePicture: base64String });
          updateUser(response.data.user);
        } catch (err) {
          console.error('Failed to update profile picture:', err);
        } finally {
          setUpdating(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative group shrink-0">
      <div className={`${size} rounded-[32px] bg-white border-4 border-white shadow-2xl shadow-slate-200/50 overflow-hidden relative transition-all duration-500 hover:rounded-[40px]`}>
        {user?.profilePicture ? (
          <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-sky-50 text-sky-500">
            <User className="w-12 h-12" />
          </div>
        )}
        
        {updating && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <label className="absolute -bottom-2 -right-2 p-2.5 bg-slate-900 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-sky-500 transition-all active:scale-90 group-hover:scale-110 z-20">
        <Camera className="w-4 h-4" />
        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={updating} />
      </label>
    </div>
  );
};

export default ProfilePictureUpload;
