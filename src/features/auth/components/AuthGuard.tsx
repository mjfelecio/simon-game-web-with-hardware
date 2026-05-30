import type { ReactNode } from "react";
import LoginModal from "@/features/title/components/LoginModal";
import { useAuth } from "@/features/auth/components/AuthProvider";
import LoadingScreen from "@/globals/components/layouts/LoadingScreen";

type AuthGuardProps = {
  children: ReactNode;
};

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isAGuest, isLoading } = useAuth();
  const isTitleScreen = window.location.pathname === "/";

  // Avoid showing the login modal until session restoration completes.
  if (isLoading) {
    return <LoadingScreen text="Restoring session..." />;
  }

  if (isTitleScreen) {
    return children
  }

  return (
    <>
      {children}

      <LoginModal
        isOpen={!(isAuthenticated || isAGuest)}
        onLogin={() => {}}
      />
    </>
  );
};

export default AuthGuard;