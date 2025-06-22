import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileForm from "../ProfileForm";
import * as usersService from "../../services/users";

// Mock supabase client
vi.mock("../../lib/supabaseClient", () => import("../../lib/supabaseClient.mock"));

describe("ProfileForm", () => {
  const user = { id: "1", email: "test@example.com", user_metadata: { name: "Test" } };
  it("affiche les champs du profil", () => {
    render(<ProfileForm user={user} profile={null} />);
    expect(screen.getByLabelText(/Nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rôle/i)).toBeInTheDocument();
  });

  it("valide le formulaire et affiche une erreur si nom vide", async () => {
    render(<ProfileForm user={user} profile={null} />);
    fireEvent.change(screen.getByLabelText(/Nom/i), { target: { value: "" } });
    const submitBtn = screen.getByRole("button", { name: /Créer/i }) || screen.getAllByRole("button")[1];
    fireEvent.submit(submitBtn);
    expect(await screen.findByText(/Nom requis/i)).toBeInTheDocument();
  });

  it("soumet le formulaire avec des valeurs valides", async () => {
    const mockCreate = vi.fn();
    vi.spyOn(usersService, "createUserProfile").mockImplementation(mockCreate);
    render(<ProfileForm user={user} profile={null} />);
    fireEvent.change(screen.getByLabelText(/Nom/i), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText(/Rôle/i), { target: { value: "client" } });
    const submitBtn = screen.getByRole("button", { name: /Créer/i }) || screen.getAllByRole("button")[1];
    fireEvent.submit(submitBtn);
    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
  });
});
