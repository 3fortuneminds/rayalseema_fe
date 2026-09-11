import { Camera } from "lucide-react";
import { useEffect, useState } from "react";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { toast } from "../../components/Toast";
import { getProfile, updateProfile } from "../../services/authApi";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile()
      .then(({ data }) => {
        setProfile(data.data);
        setFullName(data.data.full_name ?? "");
        setPhoneNumber(data.data.phone_number ?? "");
      })
      .catch(() => toast.error("Could not load profile"));
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let payload;
      if (avatarFile) {
        payload = new FormData();
        payload.append("full_name", fullName);
        payload.append("phone_number", phoneNumber);
        payload.append("avatar", avatarFile);
      } else {
        payload = { full_name: fullName, phone_number: phoneNumber };
      }
      const { data } = await updateProfile(payload);
      setProfile(data.data);
      toast.success("Profile updated");
    } catch {
      toast.error("Could not update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="page-loading">Loading…</div>;

  const avatarSrc = avatarPreview ?? profile.avatar;
  const initial = (profile.full_name || profile.email).charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p>Manage your personal details</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="profile-header">
            <div className="profile-avatar">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" />
              ) : (
                <div className="profile-avatar-fallback">{initial}</div>
              )}
              <label className="profile-avatar-edit">
                <Camera size={13} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <h3>{profile.full_name || "Add your name"}</h3>
              <p className="profile-email">{profile.email}</p>
              <span className="profile-role-badge">{profile.role}</span>
            </div>
          </div>

          <Input name="full_name" label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input
            name="phone_number"
            label="Phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
