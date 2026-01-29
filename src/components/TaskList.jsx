import { motion } from 'motion/react';

function isHebrew(text) {
  return /[\u0590-\u05FF]/.test(text);
}

function TaskList({ tasks, completed = false }) {
  return (
    <div className="space-y-2">
      {tasks.map((task, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: i * 0.05,
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
          className={`flex items-start gap-2.5 text-sm py-1 ${completed ? 'opacity-60' : ''}`}
          style={{ direction: isHebrew(task) ? 'rtl' : 'ltr' }}
        >
          {/* Checkbox/Status Icon */}
          <motion.div
            className={`
              mt-0.5 w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0
              ${completed
                ? 'bg-green-500/20 border border-green-500/30'
                : 'bg-white/[0.04] border border-white/10'
              }
            `}
            whileHover={{ scale: 1.2, borderColor: 'rgba(255,255,255,0.3)' }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {completed ? (
              <motion.svg
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, delay: i * 0.05 }}
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-green-400"
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            ) : (
              <motion.div
                className="w-1 h-1 rounded-full bg-white/30"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>

          {/* Task Text */}
          <span className={`
            flex-1 leading-relaxed
            ${completed
              ? 'text-white/40 line-through decoration-white/20'
              : 'text-white/70'
            }
          `}>
            {task}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export default TaskList;
