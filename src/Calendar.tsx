import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ko } from 'date-fns/locale';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  todosByDate: Map<string, number>;
}

export default function Calendar({ selectedDate, onDateSelect, todosByDate }: CalendarProps) {
  const currentMonth = startOfMonth(selectedDate);
  const monthStart = startOfWeek(currentMonth, { weekStartsOn: 0 });
  const monthEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const goToPreviousMonth = () => onDateSelect(subMonths(currentMonth, 15));
  const goToNextMonth = () => onDateSelect(addMonths(currentMonth, 15));
  const goToToday = () => onDateSelect(new Date());

  const getTodoCountForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return todosByDate.get(dateKey) || 0;
  };

  return (
    <div className="bg-white/95 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-violet-100 rounded-lg transition-colors text-gray-600 hover:text-violet-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-800">
            {format(currentMonth, 'yyyy년 M월', { locale: ko })}
          </h2>
        </div>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-violet-100 rounded-lg transition-colors text-gray-600 hover:text-violet-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Today Button */}
      <button
        onClick={goToToday}
        className="w-full mb-4 py-2 px-4 bg-violet-50 text-violet-600 rounded-lg text-sm font-medium hover:bg-violet-100 transition-colors"
      >
        오늘
      </button>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentDay = isToday(date);
          const todoCount = getTodoCountForDate(date);

          return (
            <button
              key={date.getTime()}
              onClick={() => onDateSelect(date)}
              className={`
                relative aspect-square rounded-lg font-medium text-sm
                transition-all duration-200
                ${isCurrentMonth ? 'text-gray-800' : 'text-gray-300'}
                ${isSelected
                  ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                  : 'hover:bg-violet-50'
                }
                ${isCurrentDay && !isSelected ? 'border-2 border-violet-400' : ''}
              `}
            >
              <span className="absolute inset-0 flex items-center justify-center">
                {format(date, 'd')}
              </span>
              {todoCount > 0 && (
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {todoCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}