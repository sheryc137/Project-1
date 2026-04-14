import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function MenuItemCard({ item, restaurant }) {
  const { addItem } = useCart();
  const [selectedOptions, setSelectedOptions] = useState({});

  const handleOptionChange = (label, choice) => {
    setSelectedOptions((prev) => ({ ...prev, [label]: choice }));
  };

  const handleAdd = () => {
    const opts = item.customizationOptions?.map((opt) => {
      const choice = selectedOptions[opt.label] || opt.choices[0];
      return { label: opt.label, choice: choice.name, additionalCost: choice.additionalCost || 0 };
    }) || [];
    addItem({ ...item, selectedOptions: opts }, restaurant);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="card p-4 flex gap-4">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{item.name}</h4>
        {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}

        {item.customizationOptions?.map((opt) => (
          <div key={opt.label} className="mt-2">
            <p className="text-xs font-medium text-gray-600">{opt.label}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {opt.choices.map((choice) => (
                <button
                  key={choice.name}
                  onClick={() => handleOptionChange(opt.label, choice)}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                    (selectedOptions[opt.label] || opt.choices[0])?.name === choice.name
                      ? 'bg-wave text-white border-wave'
                      : 'border-gray-300 text-gray-600 hover:border-wave'
                  }`}
                >
                  {choice.name}
                  {choice.additionalCost > 0 && ` (+${formatCurrency(choice.additionalCost)})`}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-gray-900">{formatCurrency(item.price)}</span>
          <button onClick={handleAdd} className="btn-primary py-1 px-3 text-xs">
            + Add
          </button>
        </div>
      </div>

      {item.imageUrl && (
        <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden">
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}
