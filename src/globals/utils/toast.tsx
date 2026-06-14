import toast, { type Toast } from "react-hot-toast";
import {
  CheckCircle2,
  XCircle,
  Info,
  TriangleAlert,
  LoaderCircle,
} from "lucide-react";
import { cn } from "@/globals/libs/styleUtils";
import type { ReactNode } from "react";

type ToastVariant = "success" | "error" | "loading" | "info" | "warning";

/**
 * Optional action button displayed on the right side of a toast.
 *
 * Useful for:
 * - Retry actions
 * - Undo actions
 * - Quick recovery flows
 */
type ToastAction = {
  label: string;
  onClick: () => void;
};

/**
 * Shared options supported by all toast variants.
 */
type ToastOptions = {
  /**
   * Optional toast id. This replaces the id holder toast with this new toast.
   */
  id?: string;
  /**
   * Additional supporting text shown below the title.
   */
  description?: string;

  /**
   * Duration before the toast automatically dismisses.
   */
  duration?: number;

  /**
   * Optional action button rendered on the right side.
   */
  action?: ToastAction;
};

type BaseToastProps = {
  t: Toast;
  title: string;
  description?: string;
  icon?: ReactNode;
  variant?: ToastVariant;
  action?: ToastAction;
};

const variantStyles: Record<ToastVariant, string> = {
  success:
    "border-emerald-400/20 bg-emerald-500/10 text-emerald-200 shadow-emerald-500/10",
  error: "border-red-400/20 bg-red-500/10 text-red-200 shadow-red-500/10",
  warning:
    "border-yellow-400/20 bg-yellow-500/10 text-yellow-200 shadow-yellow-500/10",
  info: "border-cyan-400/20 bg-cyan-500/10 text-cyan-200 shadow-cyan-500/10",
  loading: "border-white/10 bg-white/5 text-white shadow-black/20",
};

const defaultIcons: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
  warning: <TriangleAlert className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
  loading: <LoaderCircle className="h-5 w-5 animate-spin" />,
};

// eslint-disable-next-line react-refresh/only-export-components
const BaseToast = ({
  t,
  title,
  description,
  icon,
  variant = "info",
  action,
}: BaseToastProps) => {
  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-md items-start gap-4 rounded-2xl border px-4 py-4 shadow-2xl backdrop-blur-xl transition-all",
        "animate-in fade-in zoom-in-95 duration-200",
        variantStyles[variant],
        t.visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="mt-0.5 shrink-0">{icon ?? defaultIcons[variant]}</div>

      <div className="flex-1">
        <p className="font-black uppercase tracking-wide">{title}</p>

        {description && (
          <p className="mt-1 text-sm opacity-80">{description}</p>
        )}
      </div>

      {action && (
        <button
          onClick={() => {
            action.onClick();
            toast.dismiss(t.id);
          }}
          className={cn(
            "shrink-0 rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-wider transition",
            "border-white/10 bg-white/5 hover:bg-white/10 active:scale-95",
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

/* ------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------ */

/**
 * Displays a success toast.
 */
export function toastSuccess(title: string, options?: ToastOptions) {
  return toast.custom(
    (t) => (
      <BaseToast
        t={t}
        title={title}
        description={options?.description}
        variant="success"
        action={options?.action}
      />
    ),
    {
      id: options?.id,
      duration: options?.duration ?? 3000,
    },
  );
}

/**
 * Displays an error toast.
 */
export function toastError(title: string, options?: ToastOptions) {
  return toast.custom(
    (t) => (
      <BaseToast
        t={t}
        title={title}
        description={options?.description}
        variant="error"
        action={options?.action}
      />
    ),
    {
      id: options?.id,
      duration: options?.duration ?? 4000,
    },
  );
}

/**
 * Displays an informational toast.
 */
export function toastInfo(title: string, options?: ToastOptions) {
  return toast.custom(
    (t) => (
      <BaseToast
        t={t}
        title={title}
        description={options?.description}
        variant="info"
        action={options?.action}
      />
    ),
    {
      id: options?.id,
      duration: options?.duration ?? 3000,
    },
  );
}

/**
 * Displays a warning toast.
 */
export function toastWarning(title: string, options?: ToastOptions) {
  return toast.custom(
    (t) => (
      <BaseToast
        t={t}
        title={title}
        description={options?.description}
        variant="warning"
        action={options?.action}
      />
    ),
    {
      id: options?.id,
      duration: options?.duration ?? 4000,
    },
  );
}

/**
 * Displays a persistent loading toast.
 *
 * Defaults to an infinite duration until manually dismissed
 * or replaced by another toast.
 *
 * Note: Use the toastId returned to dismiss or update this toast
 */
export function toastLoading(title: string, options?: ToastOptions) {
  return toast.custom(
    (t) => (
      <BaseToast
        t={t}
        title={title}
        description={options?.description}
        variant="loading"
        action={options?.action}
      />
    ),
    {
      id: options?.id,
      duration: options?.duration ?? Infinity,
    },
  );
}

/* ------------------------------------------------ */
/* Promise Toast */
/* ------------------------------------------------ */

/**
 * Toast configuration for async promise flows.
 */
type PromiseMessages<T> = {
  /**
   * Toast shown while the promise is pending.
   */
  loading: {
    title: string;
    description: string;
    action?: ToastAction;
  };

  /**
   * Toast shown when the promise resolves successfully.
   */
  success: {
    title: string | ((data: T) => string);
    description: string | ((data: T) => string);
    action?: ToastAction;
  };

  /**
   * Toast shown when the promise rejects.
   */
  error: {
    title: string | ((err: unknown) => string);
    description: string | ((err: unknown) => string);
    action?: ToastAction;
  };
};

/**
 * Wraps a promise with themed loading, success,
 * and error toast states.
 *
 * Automatically replaces the loading toast with
 * the final resolved state.
 *
 * @example
 * await toastPromise(apiCall(), {
 *   loading: {
 *     title: "Submitting score...",
 *     description: "Syncing with leaderboard",
 *   },
 *   success: {
 *     title: "Score submitted!",
 *     description: (data) => `Rank #${data.rank}`,
 *   },
 *   error: {
 *     title: "Submission failed",
 *     description: "Please try again.",
 *     action: {
 *       label: "Retry",
 *       onClick: retrySubmit,
 *     },
 *   },
 * });
 */
export async function toastPromise<T>(
  promise: Promise<T>,
  messages: PromiseMessages<T>,
) {
  const toastId = toast.custom((t) => (
    <BaseToast
      t={t}
      title={messages.loading.title}
      description={messages.loading.description}
      variant="loading"
      action={messages.loading.action}
    />
  ));

  try {
    const data = await promise;

    toast.custom(
      (t) => (
        <BaseToast
          t={t}
          title={
            typeof messages.success.title === "function"
              ? messages.success.title(data)
              : messages.success.title
          }
          description={
            typeof messages.success.description === "function"
              ? messages.success.description(data)
              : messages.success.description
          }
          variant="success"
          action={messages.success.action}
        />
      ),
      {
        id: toastId,
        duration: 3000,
      },
    );

    return data;
  } catch (err) {
    toast.custom(
      (t) => (
        <BaseToast
          t={t}
          title={
            typeof messages.error.title === "function"
              ? messages.error.title(err)
              : messages.error.title
          }
          description={
            typeof messages.error.description === "function"
              ? messages.error.description(err)
              : messages.error.description
          }
          variant="error"
          action={messages.error.action}
        />
      ),
      {
        id: toastId,
        duration: 4000,
      },
    );

    throw err;
  }
}
