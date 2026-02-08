import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, getTextDir } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface TaskItem {
  text: string;
  completed: boolean;
  id: string;
}

interface TaskChecklistProps {
  tasks: string[];
  completed?: boolean;
  className?: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function CheckIcon({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      className="mt-0.5 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 rounded"
      aria-label={checked ? 'סמן כלא הושלם' : 'סמן כהושלם'}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={cn(checked ? 'text-green-400' : 'text-white/20')}>
        <motion.rect
          x="1"
          y="1"
          width="14"
          height="14"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="currentColor"
          initial={false}
          animate={{ fillOpacity: checked ? 0.15 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
        <AnimatePresence>
          {checked && (
            <motion.path
              d="M4.5 8L7 10.5L11.5 5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            />
          )}
        </AnimatePresence>
      </svg>
    </motion.button>
  );
}

export function TaskChecklist({ tasks: initialTasks, completed = false, className }: TaskChecklistProps) {
  const [items, setItems] = useState<TaskItem[]>(() =>
    initialTasks.map((text) => ({
      text,
      completed,
      id: generateId(),
    }))
  );
  const [newTaskText, setNewTaskText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const completedCount = items.filter((t) => t.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const toggleTask = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      )
    );
  }, []);

  const addTask = useCallback(() => {
    const text = newTaskText.trim();
    if (!text) return;
    setItems((prev) => [
      ...prev,
      { text, completed: false, id: generateId() },
    ]);
    setNewTaskText('');
    inputRef.current?.focus();
  }, [newTaskText]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  }, [addTask]);

  // All done celebration state
  if (allDone && totalCount > 0) {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Progress */}
        <div className="flex items-center gap-3 px-1">
          <ProgressBar value={100} color="bg-green-400" size="sm" />
          <span className="text-[11px] font-medium text-green-400/80 whitespace-nowrap">{completedCount}/{totalCount}</span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex flex-col items-center justify-center py-6 text-center"
        >
          <motion.span
            className="text-3xl mb-2"
            animate={{ scale: [1, 1.2, 1, 1.15, 1] }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {'\uD83C\uDF89'}
          </motion.span>
          <span className="text-sm font-medium text-white/60">כל המשימות הושלמו!</span>
        </motion.div>

        {/* Completed tasks (collapsed) */}
        <div className="space-y-0.5 opacity-50">
          {items.map((item) => {
            const dir = getTextDir(item.text);
            return (
              <div key={item.id} className="flex items-start gap-2.5 px-3 py-1">
                <CheckIcon checked={true} onToggle={() => toggleTask(item.id)} />
                <span className="text-[13px] leading-snug text-white/35 line-through" dir={dir}>
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Add task */}
        <AddTaskInput
          value={newTaskText}
          onChange={setNewTaskText}
          onAdd={addTask}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
        />
      </div>
    );
  }

  if (totalCount === 0 && !completed) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="text-center py-4 text-white/25 text-sm">
          אין משימות פתוחות
        </div>
        <AddTaskInput
          value={newTaskText}
          onChange={setNewTaskText}
          onAdd={addTask}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
        />
      </div>
    );
  }

  // Sort: uncompleted first, then completed
  const sorted = [...items].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress */}
      {totalCount > 0 && (
        <div className="flex items-center gap-3 px-1">
          <ProgressBar value={progressPercent} size="sm" />
          <span className="text-[11px] font-medium text-white/40 whitespace-nowrap tabular-nums">
            {completedCount}/{totalCount} הושלמו
          </span>
        </div>
      )}

      {/* Task list */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-0.5"
      >
        {sorted.map((item) => {
          const dir = getTextDir(item.text);

          return (
            <motion.div
              key={item.id}
              variants={staggerItem}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex items-start gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              <CheckIcon checked={item.completed} onToggle={() => toggleTask(item.id)} />

              <motion.span
                className={cn(
                  'text-[13px] leading-snug flex-1',
                  item.completed
                    ? 'text-white/35 line-through'
                    : 'text-white/70',
                )}
                dir={dir}
                animate={{ opacity: item.completed ? 0.5 : 1 }}
                transition={{ delay: item.completed ? 0.15 : 0 }}
              >
                {item.text}
              </motion.span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Add task */}
      {!completed && (
        <AddTaskInput
          value={newTaskText}
          onChange={setNewTaskText}
          onAdd={addTask}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
        />
      )}
    </div>
  );
}

function AddTaskInput({
  value,
  onChange,
  onAdd,
  onKeyDown,
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div className="flex items-center gap-2 px-3">
      <div className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] focus-within:border-blue-500/30 transition-colors">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white/20 shrink-0">
          <path d="M8 3v10M3 8h10" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="הוסף משימה..."
          className="flex-1 bg-transparent text-[12px] text-white/70 placeholder:text-white/20 outline-none"
          dir={value ? getTextDir(value) : 'rtl'}
        />
      </div>
      {value.trim() && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAdd}
          className="px-2.5 py-1.5 text-[11px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
        >
          הוסף
        </motion.button>
      )}
    </div>
  );
}
