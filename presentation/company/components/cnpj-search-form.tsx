interface CnpjSearchFormProps {
  value: string;
  loading: boolean;
  isValid: boolean;
  hasTyped: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function CnpjSearchForm({
  value,
  loading,
  isValid,
  hasTyped,
  onChange,
  onSubmit,
}: CnpjSearchFormProps) {
  return (
    <div className="rounded-2xl border border-yellow-600/30 bg-zinc-900/90 p-6 shadow-2xl shadow-yellow-950/20">
      <label htmlFor="cnpj" className="mb-2 block text-sm font-medium text-zinc-300">
        Digite o CNPJ
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="cnpj"
          value={value}
          maxLength={18}
          placeholder="00.000.000/0000-00"
          onChange={(event) => onChange(event.target.value)}
          className="h-11 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-sm text-zinc-100 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        />
        <button
          type="button"
          disabled={!isValid || loading}
          onClick={onSubmit}
          className="h-11 rounded-xl bg-amber-500 px-6 text-sm font-bold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {loading ? "Consultando..." : "Buscar"}
        </button>
      </div>
      {hasTyped && !isValid && <p className="mt-2 text-xs font-medium text-rose-400">CNPJ inválido.</p>}
    </div>
  );
}
