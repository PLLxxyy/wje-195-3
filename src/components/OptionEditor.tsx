import React from 'react';
import { WheelOption } from '../types';

interface Props {
  options: WheelOption[];
  excludedOptionIds: string[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: 'text' | 'color', value: string) => void;
  onExclude: (id: string) => void;
  onRestore: (id: string) => void;
}

export default function OptionEditor({
  options,
  excludedOptionIds,
  onAdd,
  onRemove,
  onUpdate,
  onExclude,
  onRestore,
}: Props) {
  return (
    <div>
      <div className="option-editor">
        {options.map((opt, idx) => {
          const isExcluded = excludedOptionIds.includes(opt.id);
          return (
            <div
              key={opt.id}
              className={`option-item ${isExcluded ? 'excluded' : ''}`}
            >
              <span
                style={{
                  color: isExcluded ? '#4a5a6a' : '#5a6a7a',
                  fontSize: 12,
                  width: 16,
                  textAlign: 'center',
                  flexShrink: 0,
                  textDecoration: isExcluded ? 'line-through' : 'none',
                }}
              >
                {idx + 1}
              </span>
              <div
                className="color-dot"
                style={{
                  backgroundColor: isExcluded ? '#3a4a5a' : opt.color,
                  opacity: isExcluded ? 0.5 : 1,
                }}
              >
                <input
                  type="color"
                  value={opt.color}
                  onChange={e => onUpdate(opt.id, 'color', e.target.value)}
                  disabled={isExcluded}
                />
              </div>
              <input
                className="option-input"
                value={opt.text}
                onChange={e => onUpdate(opt.id, 'text', e.target.value)}
                placeholder="输入选项文字..."
                maxLength={20}
                disabled={isExcluded}
                style={{ opacity: isExcluded ? 0.6 : 1 }}
              />
              {isExcluded ? (
                <button
                  className="option-btn restore"
                  onClick={() => onRestore(opt.id)}
                  title="恢复此选项"
                >
                  ↺
                </button>
              ) : (
                <button
                  className="option-btn exclude"
                  onClick={() => onExclude(opt.id)}
                  title="临时排除此选项"
                >
                  ⊘
                </button>
              )}
              <button
                className="option-btn delete"
                onClick={() => onRemove(opt.id)}
                disabled={options.length <= 2}
                title={options.length <= 2 ? '至少需要2个选项' : '删除此选项'}
              >
                x
              </button>
            </div>
          );
        })}
      </div>
      <button
        className="add-option-btn"
        onClick={onAdd}
        disabled={options.length >= 12}
      >
        {options.length >= 12 ? '已达到最大数量（12个）' : '+ 添加选项'}
      </button>
    </div>
  );
}
