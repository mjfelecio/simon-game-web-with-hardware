import BaseModal from "@/globals/components/layouts/BaseModal";
import Button from "@/globals/components/Button";

type ManualModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ManualModal = ({ isOpen, onClose }: ManualModalProps) => (
  <BaseModal isOpen={isOpen} onClose={onClose} className="max-w-xl">
    <div className="mb-8">
      <h2 className="text-3xl font-black uppercase tracking-wide text-white">
        Operation Manual
      </h2>
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">
        Protocol & Interface Guide
      </p>
    </div>

    <div className="max-h-[60vh] overflow-y-auto pr-2">
    <div className="space-y-8">
      {/* Section 1: The Objective */}
      <section className="space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <span className="h-px w-4 bg-slate-800" /> 01. How To Play
        </h3>
        <ol className="text-sm text-slate-300 leading-relaxed space-y-2 list-decimal list-inside">
          <li>
            Press <span className="text-white">Start</span>. The game shows a
            sequence of colored buttons, one flash at a time (with a tone for
            each color).
          </li>
          <li>
            Repeat the sequence back by pressing the buttons in the exact same
            order.
          </li>
          <li>
            If you're correct, the sequence grows by one step and you move to
            the next round.
          </li>
          <li>
            Press a button <span className="text-red-400">out of order</span> or
            press the wrong color and the game ends.
          </li>
          <li>
            Keep going as long as you can — each round gets longer and harder.
          </li>
        </ol>
      </section>

      {/* Section 2: Controls */}
      <section className="space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <span className="h-px w-4 bg-slate-800" /> 02. Inputs
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-[10px] font-bold text-white uppercase mb-1">
              Mouse / Touch
            </p>
            <p className="text-[11px] text-slate-400">
              Click or tap the on-screen buttons. This works on every device
              and needs no setup.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-[10px] font-bold text-white uppercase mb-1">
              Keyboard
            </p>
            <p className="text-[11px] text-slate-400">
              Press the number keys mapped to each color for faster input.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 col-span-2">
            <p className="text-[10px] font-bold text-white uppercase mb-1">
              Arduino (Physical Buttons)
            </p>
            <p className="text-[11px] text-slate-400">
              If you have the hardware kit, connect your Arduino through the{" "}
              <span className="text-blue-400 italic">Controller Settings</span>{" "}
              in the game. Once connected, use the tactile buttons just like the
              on-screen ones. Your input type is tracked, but this is optional —
              the game works fully without it.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Game Modes */}
      <section className="space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <span className="h-px w-4 bg-slate-800" /> 03. Game Modes
        </h3>
        <div className="rounded-xl bg-black/40 border border-white/5 p-4 space-y-3 text-[11px] text-slate-400">
          {[
            {
              name: "Classic",
              desc: "The standard Simon game. Play until you slip up.",
            },
            {
              name: "Time Attack",
              desc: "Reach the target sequence length as fast as possible.",
            },
            {
              name: "Blitz",
              desc: "The sequence plays much faster. Quick reflexes required.",
            },
            {
              name: "Echo",
              desc: "Follow the sequence by sound only — no visual highlights are shown.",
            },
            {
              name: "Ghost",
              desc: "Button colors are hidden. Rely on position and memory.",
            },
            {
              name: "Fragment",
              desc: "Only the newest button is shown each round. Remember the rest yourself.",
            },
            {
              name: "Entropy",
              desc: "Button positions shuffle after every successful round.",
            },
            {
              name: "Burst",
              desc: "Watch the entire sequence once, then repeat it all in a single attempt.",
            },
          ].map(({ name, desc }) => (
            <div key={name}>
              <p className="text-white font-bold">{name}</p>
              <p>{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Most modes unlock by reaching Level 5 in the previous mode. Time
          Attack and Burst end once you hit their target length; the rest are
          endless and end when you make a mistake.
        </p>
      </section>

      {/* Section 4: Quick Play vs Campaign */}
      <section className="space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <span className="h-px w-4 bg-slate-800" /> 04. Quick Play vs Campaign
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-[10px] font-bold text-white uppercase mb-1">
              Quick Play
            </p>
            <p className="text-[11px] text-slate-400">
              Jump straight into a mode for a casual run. Your best scores are
              submitted to the leaderboard.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-[10px] font-bold text-white uppercase mb-1">
              Campaign
            </p>
            <p className="text-[11px] text-slate-400">
              Progress across matched levels. Your highest reached level is
              saved and you resume from where you left off — even after closing
              the game. Requires a login to keep your progress.
            </p>
          </div>
        </div>
      </section>
    </div>
    </div>

    <div className="mt-8">
      <Button
        text="Acknowledge & Close"
        onClick={onClose}
        className="w-full h-14"
      />
    </div>
  </BaseModal>
);

export default ManualModal;
