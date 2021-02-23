import {IBeaconConfig} from "@chainsafe/lodestar-config";
import {lightclient, ValidatorFlag, Gwei} from "@chainsafe/lodestar-types";
import {getUnslashedParticipatingIndices} from "../state_accessor/index";
import {getPreviousEpoch} from "../../util/epoch";
import {getTotalBalance, getTotalActiveBalance} from "../../util/balance";
import {REWARD_DENOMINATOR, TIMELY_TARGET_FLAG} from "../constants";
import {getFlagsAndNumerators} from "../misc";
import {phase0} from "../..";

/**
 *  Compute the rewards and penalties associated with a particular duty, by scanning through the participation
 *  flags to determine who participated and who did not and assigning them the appropriate rewards and penalties.
 */
export function getFlagDeltas(
  config: IBeaconConfig,
  state: lightclient.BeaconState,
  flag: ValidatorFlag,
  numerator: number
): [Gwei[], Gwei[]] {
  const rewards = Array.from({length: state.validators.length}, () => BigInt(0));
  const penalties = Array.from({length: state.validators.length}, () => BigInt(0));

  const unslashedParticipatingIndices = getUnslashedParticipatingIndices(
    config,
    state,
    flag,
    getPreviousEpoch(config, state)
  );
  const increment = config.params.EFFECTIVE_BALANCE_INCREMENT;
  const unslashedParticipatingIncrements = getTotalBalance(config, state, unslashedParticipatingIndices) / increment;
  const activeIncrements = getTotalActiveBalance(config, state) / increment;
  for (const index of phase0.getEligibleValidatorIndices(config, state)) {
    const baseReward = phase0.getBaseReward(config, state, index);
    if (unslashedParticipatingIndices.indexOf(index) !== -1) {
      if (phase0.isInInactivityLeak(config, state)) {
        rewards[index] = (baseReward * BigInt(numerator)) / REWARD_DENOMINATOR;
      } else {
        rewards[index] =
          (baseReward * BigInt(numerator) * unslashedParticipatingIncrements) / (activeIncrements * REWARD_DENOMINATOR);
      }
    } else {
      penalties[index] = (baseReward * BigInt(numerator)) / REWARD_DENOMINATOR;
    }
  }
  return [rewards, penalties];
}

/**
 *   Compute the penalties associated with the inactivity leak, by scanning through the participation
 *   flags to determine who participated and who did not, applying the leak penalty globally and applying
 *   compensatory rewards to participants.
 */
export function getInactivityPenaltyDeltas(config: IBeaconConfig, state: lightclient.BeaconState): [Gwei[], Gwei[]] {
  const penalties = Array.from({length: state.validators.length}, () => BigInt(0));
  const previousEpoch = getPreviousEpoch(config, state);

  if (phase0.isInInactivityLeak(config, state)) {
    const rewardNumeratorSum = getFlagsAndNumerators().reduce((agg, [, numerator]) => agg + numerator, 0);
    const matchingTargetAttestingIndices = getUnslashedParticipatingIndices(
      config,
      state,
      TIMELY_TARGET_FLAG,
      previousEpoch
    );
    for (const index of phase0.getEligibleValidatorIndices(config, state)) {
      penalties[index] +=
        (phase0.getBaseReward(config, state, index) * BigInt(rewardNumeratorSum)) / REWARD_DENOMINATOR;
      if (matchingTargetAttestingIndices.indexOf(index) === -1) {
        const effectiveBalance = state.validators[index].effectiveBalance;
        penalties[index] +=
          (effectiveBalance * BigInt(phase0.getFinalityDelay(config, state))) /
          config.params.INACTIVITY_PENALTY_QUOTIENT;
      }
    }
  }
  const rewards = Array.from({length: state.validators.length}, () => BigInt(0));
  return [rewards, penalties];
}