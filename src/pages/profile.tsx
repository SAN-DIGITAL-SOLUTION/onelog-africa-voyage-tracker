import React from "react";
import ProfileForm from "../components/ProfileForm";
import { useAuth } from "../services/authService";
import { getUserProfile } from "../services/users";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      getUserProfile(user.id).then((data) => {
        setProfile(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div>Chargement du profil...</div>;
  if (!user) return <div>Non authentifié</div>;

  const navigate = require('react-router-dom').useNavigate();

  const handleReplayOnboarding = () => {
    localStorage.removeItem('onelog_onboarding_done');
    navigate('/onboarding');
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <h2>Mon profil</h2>
      <ProfileForm user={user} profile={profile} />
      <button
        style={{ marginTop: 16, color: '#E65100', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
        onClick={handleReplayOnboarding}
      >
        Revoir l’onboarding
      </button>
    </div>
  );
};

export default ProfilePage;
