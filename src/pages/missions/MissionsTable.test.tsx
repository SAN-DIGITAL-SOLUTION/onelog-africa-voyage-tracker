import React from "react";
import { render, screen } from "@testing-library/react";
import MissionsTable from "./MissionsTable";

describe("MissionsTable", () => {
  it("renders correctly when missionsPage is undefined", () => {
    render(
      <MissionsTable
        // @ts-expect-error purposely omit missionsPage to simulate undefined
        isLoading={false}
        error={null}
        refetchKey={[]}
      />
    );
    expect(screen.getByText(/Aucune mission trouvée/i)).toBeInTheDocument();
  });

  it("renders correctly when missionsPage is an empty array", () => {
    render(
      <MissionsTable
        missionsPage={[]}
        isLoading={false}
        error={null}
        refetchKey={[]}
      />
    );
    expect(screen.getByText(/Aucune mission trouvée/i)).toBeInTheDocument();
  });

  it("shows loading spinner when isLoading is true", () => {
    render(
      <MissionsTable
        missionsPage={[]}
        isLoading={true}
        error={null}
        refetchKey={[]}
      />
    );
    expect(screen.getByRole("cell")).toContainHTML("animate-spin");
  });
});
