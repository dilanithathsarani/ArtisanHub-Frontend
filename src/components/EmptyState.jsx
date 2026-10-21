
function EmptyState({
  title = "Nothing to display",
  description = "Please check back later.",
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eadb] text-3xl">
        ♡
      </div>

      <h3 className="text-xl font-semibold text-stone-800">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-stone-500">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;
