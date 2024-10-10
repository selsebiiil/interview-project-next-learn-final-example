"use client";

type DropdownProps = {
  options: { item: string; index: string }[];
  onSelect: (newStatus: string) => void;
};

export default function Dropdown({ options, onSelect }: DropdownProps) {
  return (
    <div>
      <ul className="w-full">
        {options.map(({ item, index }) => (
          <li
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
            key={index}
            onClick={(e) => {
              onSelect(index);
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
