import React, { useState, useEffect, useRef } from 'react';
import { WheelOption } from '../types';

interface Props {
  options: WheelOption[];
  excludedOptionIds: string[];
  spinning: boolean;
  onResult: (text: string, color: string, optionId: string) => void;
  highlightOptionId: string | null;
}

const DICE_PATTERNS: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function DiceFace({ value }: { value: number }) {
  const dots = DICE_PATTERNS[Math.min(Math.max(1, value), 6)] || [4];

  return (
    <div className="dice-face">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="dice-dot"
          style={{ display: dots.includes(i) ? 'block' : 'none' }}
        />
      ))}
    </div>
  );
}

export default function DiceMode({
  options,
  excludedOptionIds,
  spinning,
  onResult,
  highlightOptionId,
}: Props) {
  const [diceValue, setDiceValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const availableOptions = options.filter(o => !excludedOptionIds.includes(o.id));

  useEffect(() => {
    if (!spinning) return;

    setRolling(true);

    const count = availableOptions.length;
    let tick = 0;
    const totalTicks = 20;

    intervalRef.current = setInterval(() => {
      tick++;
      const maxVal = Math.min(count, 6);
      setDiceValue(Math.floor(Math.random() * maxVal) + 1);

      if (tick >= totalTicks) {
        if (intervalRef.current) clearInterval(intervalRef.current);

        const winOpt = availableOptions[Math.floor(Math.random() * availableOptions.length)];
        const finalDiceVal = Math.min(availableOptions.indexOf(winOpt) + 1, 6);
        setDiceValue(finalDiceVal);

        timeoutRef.current = setTimeout(() => {
          setRolling(false);
          onResult(winOpt.text, winOpt.color, winOpt.id);
        }, 400);
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [spinning]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="dice-container">
        <div className={rolling ? 'dice-face rolling' : 'dice-face'}>
          <DiceFace value={diceValue} />
        </div>
      </div>

      {/* Options grid showing all options */}
      <div className="dice-options-grid">
        {options.map((opt, i) => {
          const isExcluded = excludedOptionIds.includes(opt.id);
          return (
            <div
              key={opt.id}
              className={`dice-option-card ${highlightOptionId === opt.id ? 'highlight' : ''} ${isExcluded ? 'excluded' : ''}`}
              style={{
                background: isExcluded ? '#3a4a5a' : opt.color + 'cc',
                opacity: isExcluded ? 0.5 : 1,
                textDecoration: isExcluded ? 'line-through' : 'none',
              }}
            >
              <span style={{ marginRight: 4, opacity: 0.7, fontSize: 12 }}>{i + 1}.</span>
              {opt.text}
              {isExcluded && <span style={{ marginLeft: 4, fontSize: 10 }}>✕</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
