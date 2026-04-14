import { formatCurrency } from '../../utils/formatCurrency';

const PRESET_PCTS = [0, 10, 15, 20];

export default function TipSelector({ subtotal, tip, onChange }) {
  const presets = PRESET_PCTS.map((pct) => Math.round(subtotal * pct / 100));

  return (
    <div>
      <label className="label">Tip for your driver</label>
      <div className="flex gap-2 flex-wrap">
        {presets.map((amount, i) => (
          <button
            key={amount}
            type="button"
            onClick={() => onChange(amount)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              tip === amount ? 'bg-wave text-white border-wave' : 'border-gray-300 text-gray-600 hover:border-wave'
            }`}
          >
            {PRESET_PCTS[i] === 0 ? 'No tip' : `${PRESET_PCTS[i]}% (${formatCurrency(amount)})`}
          </button>
        ))}
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500">Custom $</span>
          <input
            type="number"
            min="0"
            step="0.01"
            className="input w-20 py-1"
            placeholder="0.00"
            onChange={(e) => onChange(Math.round(parseFloat(e.target.value || '0') * 100))}
          />
        </div>
      </div>
    </div>
  );
}
