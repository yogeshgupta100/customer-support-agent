import { describe, expect, it } from "vitest";
import { getCustomerById, listCustomers } from "@/lib/services/customerService";
import { createTestCustomer } from "./helpers";

describe("customerService", () => {
  it("returns a customer for a valid id", async () => {
    const created = await createTestCustomer({ name: "Integration Test Customer" });

    const found = await getCustomerById(created.id);

    expect(found).not.toBeNull();
    expect(found?.name).toBe("Integration Test Customer");
  });

  it("returns null for a nonexistent customer id", async () => {
    const found = await getCustomerById("does-not-exist");
    expect(found).toBeNull();
  });

  it("lists customers including a newly created one", async () => {
    const created = await createTestCustomer();
    const all = await listCustomers();
    expect(all.some((c) => c.id === created.id)).toBe(true);
  });
});
