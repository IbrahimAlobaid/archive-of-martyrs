import React from "react";
import { render, screen } from "@testing-library/react";

import { EmptyState } from "@/components/ui/EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="لا توجد نتائج" description="يرجى تغيير المرشحات" />);

    expect(screen.getByText("لا توجد نتائج")).toBeInTheDocument();
    expect(screen.getByText("يرجى تغيير المرشحات")).toBeInTheDocument();
  });
});
