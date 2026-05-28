import BTN_HOVER from "@/globals/assets/audio/sfx/hover-btn.mp3";
import BTN_CLICK from "@/globals/assets/audio/sfx/select.wav";

import AWESOME from "@/globals/assets/audio/sfx/awesome.wav";
import EXCELLENT from "@/globals/assets/audio/sfx/excellent.wav";
import WONDERFUL from "@/globals/assets/audio/sfx/wonderful.wav";

import BEGIN from "@/globals/assets/audio/sfx/begin.wav";
import OVER from "@/globals/assets/audio/sfx/over.wav";

export const SFX = {
	// BUTTONS
	BTN_HOVER,
	BTN_CLICK,

	// MARKERS
	BEGIN,
	OVER,

	// APPLAUSE
	AWESOME,
	EXCELLENT,
	WONDERFUL
} as const
