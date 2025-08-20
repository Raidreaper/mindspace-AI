import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MoodSelectorProps {
  selectedMood: number;
  onMoodSelect: (mood: number) => void;
}

const moods = [
  { value: 1, label: "Terrible", emoji: "😰", color: "mood-terrible" },
  { value: 2, label: "Bad", emoji: "😔", color: "mood-bad" },
  { value: 3, label: "Okay", emoji: "😐", color: "mood-okay" },
  { value: 4, label: "Good", emoji: "😊", color: "mood-good" },
  { value: 5, label: "Great", emoji: "😄", color: "mood-great" },
];

export function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {moods.map((mood) => (
        <Button
          key={mood.value}
          variant={selectedMood === mood.value ? "default" : "outline"}
          size="sm"
          onClick={() => onMoodSelect(mood.value)}
          className={`flex flex-col gap-1 h-auto py-3 transition-all duration-300 hover:scale-105 ${
            selectedMood === mood.value 
              ? `bg-${mood.color} hover:bg-${mood.color}/90 border-${mood.color}` 
              : `hover:bg-${mood.color}/10 border-muted hover:border-${mood.color}/50`
          }`}
        >
          <span className="text-lg">{mood.emoji}</span>
          <span className="text-xs font-medium">{mood.label}</span>
        </Button>
      ))}
    </div>
  );
}