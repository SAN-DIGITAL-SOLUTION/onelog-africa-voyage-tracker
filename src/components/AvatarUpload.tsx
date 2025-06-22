import React, { useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface AvatarUploadProps {
  userId: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ userId, onUpload, currentUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(currentUrl || "");

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${userId}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      onUpload(data.publicUrl);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div>
        {avatarUrl ? <img src={avatarUrl} alt="Avatar" style={{ width: 80, height: 80, borderRadius: "50%" }} /> : <span>Aucun avatar</span>}
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={uploadAvatar}
      />
      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
        {uploading ? "Upload..." : "Changer l’avatar"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
};

export default AvatarUpload;
