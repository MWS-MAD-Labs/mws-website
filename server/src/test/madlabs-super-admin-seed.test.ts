import { describe, expect, it } from "bun:test";
import { planMadLabsSuperAdmins } from "../services/madlabs-super-admin-seed";
import type { CentralUser } from "../types/central-types";
import { testUser } from "./test-helpers";

type Employee = Extract<CentralUser, { source: "employee" }>;

const MAD_LABS = "unit-mad-lab";

function employee(overrides: Partial<Employee>): Employee {
  return { ...(testUser as Employee), ...overrides };
}

describe("planMadLabsSuperAdmins", () => {
  it("creates SUPER_ADMINs only for active employees in the MAD Labs unit", () => {
    const actions = planMadLabsSuperAdmins({
      madLabsUnitId: MAD_LABS,
      existingUsers: [],
      employees: [
        employee({ id: "emp-1", email: "One@Millennia21.id" }),
        employee({ id: "emp-2", email: "two@millennia21.id", unitId: "unit-other", unit_id: "unit-other" }),
        employee({ id: "emp-3", email: "three@millennia21.id", status: "INACTIVE" }),
      ],
    });

    expect(actions).toEqual([
      {
        type: "create",
        identity: {
          centralUserId: "emp-1",
          email: "one@millennia21.id",
          name: testUser.full_name,
          unitId: MAD_LABS,
        },
      },
    ]);
  });

  it("promotes an existing ADMIN matched by email and leaves SUPER_ADMINs alone", () => {
    const actions = planMadLabsSuperAdmins({
      madLabsUnitId: MAD_LABS,
      employees: [
        employee({ id: "emp-1", email: "one@millennia21.id" }),
        employee({ id: "emp-2", email: "two@millennia21.id" }),
      ],
      existingUsers: [
        { id: "u1", centralUserId: "old-id", email: "one@millennia21.id", isActive: true, roleName: "ADMIN" },
        { id: "u2", centralUserId: "emp-2", email: "two@millennia21.id", isActive: true, roleName: "SUPER_ADMIN" },
      ],
    });

    expect(actions.map((action) => action.type)).toEqual(["promote", "unchanged"]);
  });

  it("never reactivates a deactivated CMS account", () => {
    const [action] = planMadLabsSuperAdmins({
      madLabsUnitId: MAD_LABS,
      employees: [employee({ id: "emp-1" })],
      existingUsers: [
        { id: "u1", centralUserId: "emp-1", email: testUser.email, isActive: false, roleName: "ADMIN" },
      ],
    });

    expect(action?.type).toBe("skip");
  });

  it("skips Central records without an email", () => {
    const [action] = planMadLabsSuperAdmins({
      madLabsUnitId: MAD_LABS,
      employees: [employee({ id: "emp-1", email: "" })],
      existingUsers: [],
    });

    expect(action?.type).toBe("skip");
  });
});
