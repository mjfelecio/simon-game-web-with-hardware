import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

const PageWrapper = ({ children, className = "" }: Props) => (
  <main
    className={`min-h-svh w-full bg-slate-950 flex flex-col items-center justify-center p-4 text-white ${className}`}
  >
    <div className="w-full max-w-6xl flex flex-col items-center justify-center">
      {children}
    </div>
  </main>
);

export default PageWrapper;