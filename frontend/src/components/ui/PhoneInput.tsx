import type { Country } from "react-phone-number-input";
import PhoneInputWithCountry from "react-phone-number-input";
import "react-phone-number-input/style.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: Country;
  required?: boolean;
  placeholder?: string;
};

export default function PhoneInput({
  value,
  onChange,
  defaultCountry = "IN",
  required,
  placeholder = "Mobile number",
}: Props) {
  return (
    <PhoneInputWithCountry
      international
      defaultCountry={defaultCountry}
      value={value || undefined}
      onChange={(v) => onChange(v ?? "")}
      placeholder={placeholder}
      className="phone-input-wrap"
      numberInputProps={{ className: "input-field phone-input-field", required }}
    />
  );
}
