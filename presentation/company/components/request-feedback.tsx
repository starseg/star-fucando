interface RequestFeedbackProps {
  message: string;
}

export function RequestFeedback({ message }: RequestFeedbackProps) {
  return <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{message}</p>;
}
