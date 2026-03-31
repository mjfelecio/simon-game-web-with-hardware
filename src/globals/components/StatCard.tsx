const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
      {label}
    </span>
    <span className="text-2xl font-black text-white italic">{value}</span>
  </div>
);

export default StatCard;
