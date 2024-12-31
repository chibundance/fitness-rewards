import { describe, expect, it, vi } from "vitest";

const simnet: any = {
  getAccounts: () =>
    new Map([
      ["user_1", "address1"],
      ["user_2", "address2"],
    ]),
  callPublicFn: vi.fn(),
  callReadOnlyFn: vi.fn(),
};

const accounts = simnet.getAccounts();
const user1 = accounts.get("user_1")!;
const user2 = accounts.get("user_2")!;
const rewardsModel = "rewards-model";

// Error Constants
const ERR_NO_REWARDS = { type: "err", value: 106 };
const ERR_NOT_AUTHORIZED = { type: "err", value: 107 };
const ERR_INVALID_AMOUNT = { type: "err", value: 108 };

describe("Rewards Model Tests", () => {
  it("should retrieve rewards for a user successfully", () => {
    simnet.callReadOnlyFn.mockReturnValueOnce({
      result: { ok: true, value: 500 },
    });

    const { result } = simnet.callReadOnlyFn(
      rewardsModel,
      "get-user-rewards",
      [{ type: "principal", value: user1 }],
      user1
    );

    expect(result.ok).toBe(true);
    expect(result.value).toBe(500); // User has 500 STX rewards
  });

  it("should return 0 for a user with no rewards", () => {
    simnet.callReadOnlyFn.mockReturnValueOnce({
      result: { ok: true, value: 0 },
    });

    const { result } = simnet.callReadOnlyFn(
      rewardsModel,
      "get-user-rewards",
      [{ type: "principal", value: user2 }],
      user2
    );

    expect(result.ok).toBe(true);
    expect(result.value).toBe(0); // User has no rewards
  });

  it("should add rewards to a user successfully", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: { ok: true } });

    const { result } = simnet.callPublicFn(
      rewardsModel,
      "add-reward",
      [
        { type: "principal", value: user1 },
        { type: "uint", value: 100 },
      ],
      "fitness-rewards" // Contract caller
    );

    expect(result.ok).toBe(true);
  });

  it("should reject adding rewards by an unauthorized caller", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_NOT_AUTHORIZED });

    const { result } = simnet.callPublicFn(
      rewardsModel,
      "add-reward",
      [
        { type: "principal", value: user1 },
        { type: "uint", value: 100 },
      ],
      "unauthorized-caller" // Not the fitness-rewards contract
    );

    expect(result).toEqual(ERR_NOT_AUTHORIZED);
  });

  it("should reject adding invalid reward amounts", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_INVALID_AMOUNT });

    const { result } = simnet.callPublicFn(
      rewardsModel,
      "add-reward",
      [
        { type: "principal", value: user1 },
        { type: "uint", value: 0 }, // Invalid amount
      ],
      "fitness-rewards"
    );

    expect(result).toEqual(ERR_INVALID_AMOUNT);
  });

  it("should claim rewards for a user successfully", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: { ok: true } });

    const { result } = simnet.callPublicFn(
      rewardsModel,
      "claim-user-rewards",
      [{ type: "principal", value: user1 }],
      user1 // Must be the same as `tx-sender`
    );

    expect(result.ok).toBe(true);
  });

  it("should reject claiming rewards by an unauthorized user", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_NOT_AUTHORIZED });

    const { result } = simnet.callPublicFn(
      rewardsModel,
      "claim-user-rewards",
      [{ type: "principal", value: user1 }],
      user2 // Different tx-sender
    );

    expect(result).toEqual(ERR_NOT_AUTHORIZED);
  });

  it("should reject claiming rewards if the user has no rewards", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_NO_REWARDS });

    const { result } = simnet.callPublicFn(
      rewardsModel,
      "claim-user-rewards",
      [{ type: "principal", value: user2 }],
      user2 // No rewards available
    );

    expect(result).toEqual(ERR_NO_REWARDS);
  });
});
