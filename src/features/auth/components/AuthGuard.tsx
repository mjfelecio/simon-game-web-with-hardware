import type { ReactNode } from "react";
import LoginModal from "@/features/title/components/LoginModal";
import { useAuth } from "@/features/auth/components/AuthProvider";
import LoadingScreen from "@/globals/components/layouts/LoadingScreen";

type AuthGuardProps = {
  children: ReactNode;
};

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, isLoading } = useAuth();
	const isInTitleScreen = window.location.pathname === "/";

  // Avoid showing the login modal until session restoration completes.
  if (isLoading) {
    return <LoadingScreen text="Restoring session..." />;
  }

	// Don't show modal if we are in title screen
	if (isInTitleScreen) {
		return children;
	}

  return (
    <>
      {children}

      <LoginModal
        isOpen={!user}
        persistent
        onClose={() => {}}
      />
    </>
  );
};

export default AuthGuard;