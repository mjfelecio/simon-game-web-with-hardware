import { useRef } from "react";
import type { InputType } from "@/globals/types/simon";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Data recorded for a single round of gameplay.
 * A round begins when the player is allowed to input and ends on correct
 * completion or an incorrect input.
 */
export type RoundAnalytics = {
  /** 1-based round index within the current game session. Tracked internally. */
  round: number;
  /** `performance.now()` timestamp when the round became interactive. */
  startedAt: number;
  /**
   * `performance.now()` timestamps for each successful input.
   * Failed inputs are not recorded here — see {@link RoundAnalytics.failedAtIndex}.
   */
  inputTimestamps: number[];
  /**
   * `performance.now()` timestamp when the round was fully completed.
   * Absent if the round ended in a failure.
   */
  completedAt?: number;
  /**
   * The 0-based sequence index at which the player failed.
   * `0` means the player failed on the very first input.
   * Absent if the round was completed successfully.
   */
  failedAtIndex?: number;
};

/**
 * Snapshot of all computed metrics for a completed game.
 * All durations are in milliseconds.
 */
export type GameAnalyticsSummary = {
  /** Total game time from {@link GameAnalytics.startGame} to {@link GameAnalytics.endGame}. */
  gameDuration: number | null;
  /**
   * Average time from round start to first correct input.
   * This is the primary Simon reaction time metric. See
   * {@link GameAnalytics.getAverageInitialReactionTime} for full explanation.
   */
  averageInitialReactionTime: number | null;
  /**
   * Average interval between consecutive correct inputs within a sequence.
   * Measures motor execution speed, not recall. See
   * {@link GameAnalytics.getAverageInputInterval} for full explanation.
   */
  averageInputInterval: number | null;
  /** Average time from first correct input to round completion. */
  averageExecutionTime: number | null;
  /** Average total round duration (start to completion). Excludes lost rounds. */
  averageRoundTime: number | null;
  /**
   * The sequence index the player failed on most frequently.
   * Useful for understanding whether errors are recall or execution problems.
   */
  mostCommonFailureIndex: number | null;
  /** Total number of rounds played, including the losing round. */
  totalRounds: number;
  /** All input methods used during the game. */
  inputsUsed: InputType[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Computes the arithmetic mean of an array of numbers, rounded to the nearest
 * integer. Returns `null` for empty arrays.
 */
function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

/**
 * Tracks analytics for a single Simon game session.
 *
 * This class is deliberately framework-agnostic: it has no dependency on React
 * and no lifecycle side effects. It should be instantiated once per game via
 * {@link useGameAnalytics}, which keeps the instance stable across renders.
 *
 * ## Lifecycle
 * ```
 * startGame()
 *   └─ startRound()
 *        ├─ recordInputType()      (once per unique input method)
 *        ├─ recordSuccessfulInput() (once per correct press)
 *        └─ completeRound()         (on full sequence completion)
 *             └─ startRound() ...   (repeat until game ends)
 *   └─ recordFailure(atIndex)       (on wrong input)
 *   └─ endGame()
 *   └─ getSummary() / individual getters
 * ```
 *
 * @example
 * const analytics = new GameAnalytics();
 *
 * analytics.startGame();
 * analytics.startRound();
 * analytics.recordInputType("keyboard");
 * analytics.recordSuccessfulInput();
 * analytics.recordSuccessfulInput();
 * analytics.completeRound();
 *
 * analytics.startRound();
 * analytics.recordInputType("mouse");
 * analytics.recordSuccessfulInput();
 * analytics.recordFailure(1); // failed on second input
 * analytics.endGame();
 *
 * analytics.getGameDuration();               // total ms
 * analytics.getAverageInitialReactionTime(); // primary reaction time metric
 * analytics.getSummary();                    // all metrics at once
 */
export class GameAnalytics {
  private _rounds: RoundAnalytics[] = [];
  private _gameStartedAt: number | null = null;
  private _gameCompletedAt: number | null = null;

  /**
   * Tracks which input methods (keyboard, mouse, touch…) the player used.
   *
   * Exposed as `{ current: Set<InputType> }` to remain structurally compatible
   * with `React.MutableRefObject<Set<InputType>>`, allowing it to be passed
   * directly to hooks that expect a ref (e.g. `useScoreSubmission`).
   *
   * The inner `Set` is **mutated in place** and never replaced, so the
   * reference in `.current` stays stable for the lifetime of this instance.
   *
   * @example
   * // Compatible with useScoreSubmission without any adapter:
   * useScoreSubmission({ inputsUsed: analytics.inputsUsed })
   */
  readonly inputsUsed: { current: Set<InputType> } = {
    current: new Set<InputType>(),
  };

  // ---------------------------------------------------------------------------
  // Game lifecycle
  // ---------------------------------------------------------------------------

  /**
   * Resets all analytics state and begins tracking a new game.
   *
   * Call this immediately before the first sequence is played, after any
   * campaign/mode setup is complete. Clears rounds, durations, and input types.
   */
  startGame(): void {
    this._rounds = [];
    this._gameStartedAt = performance.now();
    this._gameCompletedAt = null;
    this.inputsUsed.current.clear();
  }

  /**
   * Marks the end of the game, whether by victory or loss.
   *
   * **Safe to call multiple times:** only the first call is recorded. This
   * prevents incorrect timestamps if both a loss path and a cleanup path
   * both call `endGame()`.
   *
   * Should be called before reading any duration-based metrics.
   */
  endGame(): void {
    if (this._gameCompletedAt !== null) return;
    this._gameCompletedAt = performance.now();
  }

  // ---------------------------------------------------------------------------
  // Round lifecycle
  // ---------------------------------------------------------------------------

  /**
   * Begins tracking a new round.
   *
   * Call this when the player is allowed to start entering inputs — i.e. after
   * the sequence finishes playing (or immediately in time-attack mode).
   *
   * The round number is derived internally from the round count, removing the
   * need to pass in `core.level` and avoiding sync issues in campaign mode.
   */
  startRound(): void {
    this._rounds.push({
      round: this._rounds.length + 1,
      startedAt: performance.now(),
      inputTimestamps: [],
    });
  }

  /**
   * Records successful completion of the current round.
   *
   * Call this immediately after the player's final correct input is confirmed,
   * before advancing to the next round. If no round has been started, this
   * is a no-op.
   */
  completeRound(): void {
    const current = this._currentRound;
    if (!current) return;
    current.completedAt = performance.now();
  }

  /**
   * Records that the player submitted an incorrect input, and at which position
   * in the sequence they failed.
   *
   * Call this on the loss path **before** calling {@link endGame}. This data
   * powers {@link getMostCommonFailureIndex}, which reveals whether players
   * struggle with recall (low indices) or later execution (high indices).
   *
   * @param atIndex - 0-based sequence index of the incorrect input.
   *   Pass `core.inputs.length` at the time of the wrong press, which is the
   *   index the player was expected to input next.
   *
   * @example
   * // In the loss path of handleInput:
   * analytics.recordFailure(core.inputs.length);
   * analytics.endGame();
   */
  recordFailure(atIndex: number): void {
    const current = this._currentRound;
    if (!current) return;
    current.failedAtIndex = atIndex;
  }

  // ---------------------------------------------------------------------------
  // Input tracking
  // ---------------------------------------------------------------------------

  /**
   * Records an input method as having been used in this game.
   * Duplicate types are ignored — only the first occurrence of each type is
   * stored. Safe to call on every input event.
   *
   * @param type - The input method used (e.g. `"keyboard"`, `"mouse"`, `"touch"`).
   */
  recordInputType(type: InputType): void {
    this.inputsUsed.current.add(type);
  }

  /**
   * Records the `performance.now()` timestamp of a successful (correct) input
   * in the current round.
   *
   * Only call this when the input matches the expected sequence element.
   * Incorrect inputs should be recorded via {@link recordFailure} instead.
   * If no round has been started, this is a no-op.
   */
  recordSuccessfulInput(): void {
    const current = this._currentRound;
    if (!current) return;
    current.inputTimestamps.push(performance.now());
  }

  // ---------------------------------------------------------------------------
  // Metrics
  // ---------------------------------------------------------------------------

  /**
   * Total game duration in milliseconds, from {@link startGame} to
   * {@link endGame}.
   *
   * Returns `null` if the game has not yet ended or was never started.
   */
  getGameDuration(): number | null {
    if (this._gameStartedAt === null || this._gameCompletedAt === null) {
      return null;
    }
    return Math.round(this._gameCompletedAt - this._gameStartedAt);
  }

  /**
   * **The primary reaction time metric for a Simon game.**
   *
   * Measures the average time from when a round becomes interactive to when
   * the player makes their **first correct input**. This is the interval that
   * captures the full cognitive workload Simon is designed to test:
   *
   * 1. Watch the sequence play
   * 2. Retrieve it from working memory
   * 3. Initiate the first motor response
   *
   * ## Why not `getAverageInputInterval`?
   * Input interval measures how fast fingers move between presses once the
   * player is already in motion — a motor skill. Initial reaction time measures
   * the memory recall + response initiation delay, which is the cognitively
   * interesting metric in a memory game.
   *
   * ## Exclusions
   * Rounds where the player failed on the first input (`inputTimestamps` is
   * empty) are excluded, as no valid first-input timestamp exists. In a rough
   * game this may reduce the sample size significantly — callers should check
   * whether the result is statistically meaningful for their use case.
   *
   * Returns `null` if no qualifying rounds exist.
   */
  getAverageInitialReactionTime(): number | null {
    const values = this._rounds
      .filter((r) => r.inputTimestamps.length > 0)
      .map((r) => r.inputTimestamps[0] - r.startedAt);

    return average(values);
  }

  /**
   * Average interval between consecutive correct inputs within a sequence,
   * in milliseconds.
   *
   * Measures **motor execution speed** — how fast the player moves through a
   * sequence once already in motion. This is distinct from
   * {@link getAverageInitialReactionTime}, which captures the memory recall
   * and response-initiation delay before the first press.
   *
   * Rounds with fewer than two successful inputs produce no intervals and are
   * excluded from the calculation.
   *
   * @example
   * // Successful inputs at: 1000ms, 1200ms, 1600ms
   * // Intervals:  [200, 400]
   * // Average:    300ms
   */
  getAverageInputInterval(): number | null {
    const intervals = this._rounds.flatMap((r) => {
      const result: number[] = [];
      for (let i = 1; i < r.inputTimestamps.length; i++) {
        result.push(r.inputTimestamps[i] - r.inputTimestamps[i - 1]);
      }
      return result;
    });

    return average(intervals);
  }

  /**
   * Average time from the first correct input to round completion,
   * in milliseconds.
   *
   * Represents **pure execution time** after recall has already occurred.
   * Compare with {@link getAverageInitialReactionTime} to understand how much
   * of a player's round time is spent on recall vs. execution.
   *
   * Rounds without at least one successful input or without a
   * `completedAt` timestamp are excluded.
   */
  getAverageExecutionTime(): number | null {
    const values = this._rounds
      .filter((r) => r.inputTimestamps.length > 0 && r.completedAt != null)
      .map((r) => r.completedAt! - r.inputTimestamps[0]);

    return average(values);
  }

  /**
   * Average total round duration in milliseconds.
   *
   * Measured from when the round became interactive to when it was
   * successfully completed. Rounds that were lost have no `completedAt`
   * timestamp and are excluded.
   */
  getAverageRoundTime(): number | null {
    const values = this._rounds
      .filter((r) => r.completedAt != null)
      .map((r) => r.completedAt! - r.startedAt);

    return average(values);
  }

  /**
   * The sequence index (0-based) where the player failed most often.
   *
   * Provides a signal about the nature of the player's errors:
   * - **Index 0** — the player frequently fails on the first press, indicating
   *   a recall problem (they forgot the sequence entirely).
   * - **High index** — the player gets deep into sequences before failing,
   *   indicating an execution or attention problem rather than a recall one.
   *
   * Returns `null` if no failures were recorded (i.e. the player won).
   */
  getMostCommonFailureIndex(): number | null {
    const failures = this._rounds
      .map((r) => r.failedAtIndex)
      .filter((i): i is number => i !== undefined);

    if (failures.length === 0) return null;

    const counts = new Map<number, number>();
    for (const index of failures) {
      counts.set(index, (counts.get(index) ?? 0) + 1);
    }

    let mostCommon = 0;
    let maxCount = 0;
    for (const [index, count] of counts) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = index;
      }
    }

    return mostCommon;
  }

  /**
   * Returns a snapshot of all computed metrics for the completed game.
   *
   * Prefer this over calling individual getters when you need multiple metrics
   * at once (e.g. when building a `game_completed` event payload or a results
   * screen). All values are computed at call time from the recorded data.
   *
   * @example
   * analytics.endGame();
   * emitter.emit("game_completed", {
   *   level: core.level,
   *   mode: config.mode,
   *   won: true,
   *   analytics: analytics.getSummary(),
   * });
   */
  getSummary(): GameAnalyticsSummary {
    return {
      gameDuration: this.getGameDuration(),
      averageInitialReactionTime: this.getAverageInitialReactionTime(),
      averageInputInterval: this.getAverageInputInterval(),
      averageExecutionTime: this.getAverageExecutionTime(),
      averageRoundTime: this.getAverageRoundTime(),
      mostCommonFailureIndex: this.getMostCommonFailureIndex(),
      totalRounds: this._rounds.length,
      inputsUsed: [...this.inputsUsed.current],
    };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns the most recently started round, or `undefined` if no round has
   * been started yet.
   */
  private get _currentRound(): RoundAnalytics | undefined {
    return this._rounds.at(-1);
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Instantiates a {@link GameAnalytics} object once and keeps it stable for
 * the lifetime of the component.
 *
 * ## Why a class, not a hook?
 * The analytics tracker has no React dependencies — no context, no state, no
 * effects. Using `useRef` to box a plain class instance gives all the benefits
 * of encapsulation (private fields, no exposed mutable refs) and testability
 * (`new GameAnalytics()` — no `renderHook` required) while staying ergonomic
 * at the call site.
 *
 * ## Stability guarantee
 * The returned instance never changes between renders. It is safe to include
 * in `useCallback` dependency arrays without causing callback recreation.
 *
 * ```ts
 * // Before: analytics was a new object every render → useCallback churn
 * const analytics = useGameAnalytics(); // old hook returned plain object
 *
 * // After: analytics is the same instance forever → stable dep
 * const analytics = useGameAnalytics(); // returns GameAnalytics instance
 * ```
 *
 * @returns A stable {@link GameAnalytics} instance.
 *
 * @example
 * export default function useSimonGame() {
 *   const analytics = useGameAnalytics();
 *
 *   // Stable: analytics never changes, so this callback only recreates
 *   // when its other deps change.
 *   const handleInput = useCallback(async (type, input) => {
 *     analytics.recordInputType(type);
 *     if (input === core.sequence[core.inputs.length]) {
 *       analytics.recordSuccessfulInput();
 *     }
 *   }, [analytics, core, config]);
 *
 *   return {
 *     // Surface the right reaction time metric for a memory game:
 *     // time from round-start to first correct press, not inter-press interval.
 *     avgReactionTime: analytics.getAverageInitialReactionTime(),
 *   };
 * }
 */
export default function useGameAnalytics(): GameAnalytics {
  // See https://react.dev/reference/react/useRef#avoiding-recreating-the-ref-contents
  const gameAnalytics = useRef<GameAnalytics | null>(null);
  if (gameAnalytics.current === null) {
    gameAnalytics.current = new GameAnalytics();
  }

  // eslint-disable-next-line react-hooks/refs
  return gameAnalytics.current;
}
