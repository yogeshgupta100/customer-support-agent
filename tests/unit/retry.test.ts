import { describe, expect, it, vi } from "vitest";
import { withRetry } from "@/lib/retry";

describe("withRetry", () => {
  it("returns the result on the first success without retrying", async () => {
    const fn = vi.fn().mockResolvedValue("ok");

    const result = await withRetry(fn, { retries: 2, backoffMs: 1 });

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries after a transient failure and succeeds", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("transient")).mockResolvedValueOnce("ok");
    const onRetry = vi.fn();

    const result = await withRetry(fn, { retries: 2, backoffMs: 1, onRetry });

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });

  it("throws the last error after exhausting all retries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("permanent"));

    await expect(withRetry(fn, { retries: 2, backoffMs: 1 })).rejects.toThrow("permanent");
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
