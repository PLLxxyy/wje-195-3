import React, { useState, useEffect, useRef } from 'react';
import { WheelOption } from '../types';

interface Props {
  options: WheelOption[];
  excludedOptionIds: string[];
  spinning: boolean;
  onResult: (text: string, color: string, optionId: string) => void;
}

export default function DrawTube({ options, excludedOptionIds, spinning, onResult }: Props) {
  const [shaking, setShaking] = useState(false);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const [sticks, setSticks] = useState<{ color: string; rotation: number; excluded: boolean }[]>([]);
  const timerRef = useRef<number>(0);

  const availableOptions = options.filter(o => !excludedOptionIds.includes(o.id));

  // Generate random stick positions
  useEffect(() => {
    const newSticks = options.map((opt) => ({
      color: opt.color,
      rotation: (Math.random() - 0.5) * 20,
      excluded: excludedOptionIds.includes(opt.id),
    }));
    setSticks(newSticks);
    setWinnerIdx(null);
  }, [options, excludedOptionIds]);

  useEffect(() => {
    if (!spinning) return;

    setShaking(true);
    setWinnerIdx(null);

    // Shake for 1.5s, then reveal
    const shakeTimer = setTimeout(() => {
      setShaking(false);

      // Pick random winner from available options
      if (availableOptions.length === 0) return;
      const winOpt = availableOptions[Math.floor(Math.random() * availableOptions.length)];
      const winIdx = options.findIndex(o => o.id === winOpt.id);
      setWinnerIdx(winIdx);

      timerRef.current = window.setTimeout(() => {
        onResult(winOpt.text, winOpt.color, winOpt.id);
      }, 600);
    }, 1500);

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(timerRef.current);
    };
  }, [spinning]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`tube-container ${shaking ? 'tube-shake' : ''}`}>
      <div className="tube-body">
        <div className="tube-band tube-band-top" />
        <div className="tube-sticks">
          {sticks.map((stick, i) => {
            const isExcluded = stick.excluded;
            const isWinner = winnerIdx === i;
            return (
              <div
                key={i}
                className={`tube-stick ${isWinner ? 'winner' : ''} ${isExcluded && !isWinner ? 'excluded' : ''}`}
                style={{
                  background: isExcluded && !isWinner
                    ? 'linear-gradient(180deg, #4a5a6a, #3a4a5a)'
                    : isWinner
                      ? `linear-gradient(180deg, #FFD700, #FFA500)`
                      : `linear-gradient(180deg, ${stick.color}, ${darkenColor(stick.color, 40)})`,
                  transform: `rotate(${stick.rotation}deg)`,
                  opacity: isExcluded && !isWinner ? 0.5 : 1,
                  ...(isWinner
                    ? {
                        height: '65px',
                        width: '10px',
                      }
                    : {}),
                }}
              >
                {/* Stick tip */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderBottom: `8px solid ${isWinner ? '#FFD700' : isExcluded ? '#3a4a5a' : stick.color}`,
                  }}
                />
                {/* Winner label */}
                {isWinner && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -30,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      whiteSpace: 'nowrap',
                      color: '#FFD700',
                      fontSize: 14,
                      fontWeight: 700,
                      textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    {options[i].text}
                  </div>
                )}
                {/* Excluded label */}
                {isExcluded && !isWinner && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: '#8892a4',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    ✕
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="tube-band tube-band-bottom" />
      </div>
    </div>
  );
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}
