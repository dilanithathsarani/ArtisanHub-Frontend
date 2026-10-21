
function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div
      className="flex min-h-48 flex-col items-center justify-center gap-4"
      role="status"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ead9c6] border-t-[#8b5e3c]" />
      <p className="text-sm text-stone-500">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
