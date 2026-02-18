import { Zap, ChefHat, Leaf } from 'lucide-react';

interface PanicButtonsProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export function PanicButtons({ activeFilter, onFilterChange }: PanicButtonsProps) {
  const filters = [
    {
      id: 'under-10',
      label: 'I have 10 Minutes',
      icon: Zap,
      color: 'bg-green-500 hover:bg-green-600',
      activeColor: 'bg-green-600 ring-4 ring-green-200',
    },
    {
      id: 'under-20',
      label: 'Under 20m',
      icon: ChefHat,
      color: 'bg-warmOrange-500 hover:bg-warmOrange-600',
      activeColor: 'bg-warmOrange-600 ring-4 ring-warmOrange-200',
    },
    {
      id: 'high-protein',
      label: 'High Protein',
      icon: Leaf,
      color: 'bg-sage-600 hover:bg-sage-700',
      activeColor: 'bg-sage-700 ring-4 ring-sage-200',
    },
  ];

  return (
    <div className="sticky top-0 z-20 bg-gradient-to-br from-sage-50 to-warmOrange-50 pb-4 pt-2">
      <div className="flex gap-3 justify-center flex-wrap px-4">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;

          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(isActive ? null : filter.id)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all transform hover:scale-105 ${
                isActive ? filter.activeColor : filter.color
              }`}
            >
              <Icon size={24} />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
