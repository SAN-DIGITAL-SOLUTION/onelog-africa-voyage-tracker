import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateUserProfile, createUserProfile } from "../services/users";
import AvatarUpload from "./AvatarUpload";

const roles = [
  { value: "admin", label: "Admin" },
  { value: "operateur", label: "Opérateur" },
  { value: "client", label: "Client" },
];

const profileSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.string().email(),
  role: z.enum(["admin", "operateur", "client"]),
  avatar_url: z.string().optional(),
});

type ProfileFormProps = {
  user: any;
  profile: any;
};

export default function ProfileForm({ user, profile }: ProfileFormProps) {
  const isNew = !profile;
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || user?.user_metadata?.name || "",
      email: profile?.email || user?.email || "",
      role: profile?.role || "client",
      avatar_url: profile?.avatar_url || "",
    },
  });

  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = React.useState(profile?.avatar_url || "");

  const onSubmit = async (values: any) => {
    values.avatar_url = avatarUrl;
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        await createUserProfile(user.id, values);
      } else {
        await updateUserProfile(user.id, values);
      }
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <AvatarUpload
          userId={user.id}
          onUpload={(url) => {
            setAvatarUrl(url);
            form.setValue("avatar_url", url);
          }}
          currentUrl={avatarUrl}
        />
      </div>
      <div>
        <label htmlFor="profile-name">Nom</label>
        <input id="profile-name" {...form.register("name")} />
        {form.formState.errors.name && <span>{form.formState.errors.name.message}</span>}
      </div>
      <div>
        <label htmlFor="profile-email">Email</label>
        <input id="profile-email" {...form.register("email")} disabled />
      </div>
      <div>
        <label htmlFor="profile-role">Rôle</label>
        <select id="profile-role" {...form.register("role")}>{roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
      </div>
      <button type="submit" disabled={saving}>{isNew ? "Créer" : "Mettre à jour"} le profil</button>
      {success && <div style={{ color: "green" }}>Profil sauvegardé !</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}
