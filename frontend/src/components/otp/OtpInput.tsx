interface Props {
  value: string;
  onChange: (v: string) => void;
  length?: number;
}

export default function OtpInput({ value, onChange, length = 6 }: Props) {
  return (
    <div>
      <label className="mb-3 block text-center text-sm font-medium text-slate-600">
        One-time password
      </label>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
        className="input-field text-center text-3xl font-bold tracking-[0.4em] text-apad-800"
        placeholder={"·".repeat(length)}
      />
    </div>
  );
}
