const StatCard = ({
  label,
  value,
  spanTwoCol = false,
}: {
  label: string;
  value: string | number;
  spanTwoCol?: boolean;
}) => (
  <div
    className={`${spanTwoCol ? "col-span-2" : ""} flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm`}
  >
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
      {label}
    </span>
    <span className="text-2xl font-black text-white italic">{value}</span>
  </div>
);

export default StatCard;
