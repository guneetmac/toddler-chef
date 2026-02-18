interface PantryPulseProps {
  selectedStaples: string[];
  onStapleToggle: (staple: string) => void;
}

export function PantryPulse({ selectedStaples, onStapleToggle }: PantryPulseProps) {
  const staples = [
    { name: 'Eggs', emoji: '🥚' },
    { name: 'Banana', emoji: '🍌' },
    { name: 'Sweet Potato', emoji: '🍠' },
    { name: 'Oats', emoji: '🥣' },
    { name: 'Chicken', emoji: '🍗' },
    { name: 'Spinach', emoji: '🥬' },
    { name: 'Cheese', emoji: '🧀' },
    { name: 'Yogurt', emoji: '🥛' },
    { name: 'Avocado', emoji: '🥑' },
    { name: 'Pasta', emoji: '🍝' },
  ];

  return (
    <div className="bg-white border-y-2 border-sage-200 py-4 mb-6 sticky top-[88px] z-10 shadow-sm">
      <div className="px-4">
        <h3 className="text-xs font-bold text-sage-700 uppercase tracking-wide mb-3">
          Pantry Pulse - Tap what you have
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {staples.map((staple) => {
            const isSelected = selectedStaples.includes(staple.name);

            return (
              <button
                key={staple.name}
                onClick={() => onStapleToggle(staple.name)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 min-w-[70px] p-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-sage-500 text-white ring-4 ring-sage-200 scale-110'
                    : 'bg-sage-50 hover:bg-sage-100 text-gray-700'
                }`}
              >
                <span className="text-3xl">{staple.emoji}</span>
                <span className="text-xs font-semibold text-center leading-tight">
                  {staple.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
