import {
  ChangeEvent,
  HTMLInputAutoCompleteAttribute,
  HTMLInputTypeAttribute,
} from "react";

interface InputProps {
  type?: HTMLInputTypeAttribute;
  id?: string;
  name?: string;
  placeholder?: string;
  autoComplete?: HTMLInputAutoCompleteAttribute;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
  type,
  autoComplete,
  id,
  onChange,
  value,
  name,
  placeholder,
}: InputProps) {
  return (
    <input
      className="flex h-10 px-3 py-2 font-medium text-md md:text-sm rounded-md border border-gray-300 focus:outline-none focus:border-gray-500 bg-gray-100"
      type={type}
      autoComplete={autoComplete}
      id={id}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
    />
  );
}
