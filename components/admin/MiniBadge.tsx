interface MiniBadgeProps {
  count: number;
}

export default function MiniBadge({ count }: { count: number }) {
  if (!count) return null;

  return (
    <span
      className="
        absolute 
        -top-2 
        -right-3 
        bg-red-500 
        text-white 
        rounded-full 
        text-[9px] 
        w-4 
        h-4 
        flex 
        items-center 
        justify-center
      "
    >
      {count}
    </span>
  );
}
