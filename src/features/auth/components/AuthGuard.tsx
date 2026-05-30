import type { ReactNode } from "react";
import LoginModal from "@/features/title/components/LoginModal";
import { useAuth } from "@/features/auth/components/AuthProvider";
import LoadingScreen from "@/globals/components/layouts/LoadingScreen";
import useAutoPlayBgMusic from "@/features/audio/hooks/useAutoPlayBgMusic";

type AuthGuardProps = {
  children: ReactNode;
};

const AuthGuard = ({ children }: AuthGuardProps) => {
  // kekeke
  useAutoPlayBgMusic();
  const { isAuthenticated, isAGuest, isLoading } = useAuth();

  // Avoid showing the login modal until session restoration completes.
  if (isLoading) {
    return <LoadingScreen text="Restoring session..." />;
  }

  return (
    <>
      {children}

      <LoginModal
        isOpen={!(isAuthenticated || isAGuest)}
        onClose={() => {}}
      />
    </>
  );
};

export default AuthGuard;