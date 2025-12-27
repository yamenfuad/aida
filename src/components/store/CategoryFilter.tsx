import { CATEGORIES, ProductCategory } from '@/types/product';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CategoryFilterProps {
  selected: ProductCategory | null;
  onSelect: (category: ProductCategory | null) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        <Button
          variant={selected === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(null)}
          className="shrink-0"
        >
          الكل
        </Button>
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={selected === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(category)}
            className="shrink-0"
          >
            {category}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
