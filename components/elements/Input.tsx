import {
  ChangeEvent,
  FocusEvent,
  HTMLInputAutoCompleteAttribute,
  HTMLInputTypeAttribute,
  KeyboardEvent,
} from "react";

type InputSize = "default" | "compact";

interface InputProps {
  type?: HTMLInputTypeAttribute;
  id?: string;
  name?: string;
  placeholder?: string;
  autoComplete?: HTMLInputAutoCompleteAttribute;
  autoFocus?: boolean;
  ariaLabel?: string;
  size?: InputSize;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

const SIZES: Record<InputSize, string> = {
  default: "h-10 px-3 py-2 text-md md:text-sm",
  compact: "w-full h-9 px-2 text-sm",
};

export default function Input({
  type,
  autoComplete,
  autoFocus,
  ariaLabel,
  size = "default",
  id,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  value,
  name,
  placeholder,
}: InputProps) {
  return (
    <input
      className={`flex font-medium rounded-md border border-gray-300 focus:outline-none focus:border-gray-500 bg-gray-100 ${SIZES[size]}`}
      type={type}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      id={id}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}
