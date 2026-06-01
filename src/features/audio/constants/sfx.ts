import BTN_HOVER from "@/globals/assets/audio/sfx/button-hover.wav";
import BTN_CLICK from "@/globals/assets/audio/sfx/button-select.wav";

import LB_HOVER from "@/globals/assets/audio/sfx/leaderboard-score.wav";
import SHOW_MODAL from "@/globals/assets/audio/sfx/options-pop-in.wav";

import AWESOME from "@/globals/assets/audio/sfx/awesome.wav";
import EXCELLENT from "@/globals/assets/audio/sfx/excellent.wav";
import WONDERFUL from "@/globals/assets/audio/sfx/wonderful.wav";

import FAIL from "@/globals/assets/audio/sfx/failsound.wav";

import BEGIN from "@/globals/assets/audio/sfx/begin.wav";
import OVER from "@/globals/assets/audio/sfx/over.wav";

export const SFX = {
	// UI
	BTN_HOVER,
	BTN_CLICK,
	LB_HOVER,
	SHOW_MODAL,

	// MARKERS
	BEGIN,
	OVER,

	// APPLAUSE
	AWESOME,
	EXCELLENT,
	WONDERFUL,

	FAIL
} as const
