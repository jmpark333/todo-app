import { useState, useMemo, useEffect, useRef } from 'react';
import { format, isToday, isSameDay, isBefore, startOfDay } from 'date-fns';
import { Todo, FilterType, ViewType } from './types';
import Calendar from './Calendar';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeSelector from './components/ThemeSelector';

const STORAGE_KEY = 'todo-app-todos';

// Helper functions for localStorage persistence
const loadTodosFromStorage = (): Todo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((todo: Todo) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      }));
    }
  } catch (e) {
    console.error('Failed to load todos from localStorage:', e);
  }
  return [];
};

const saveTodosToStorage = (todos: Todo[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    console.error('Failed to save todos to localStorage:', e);
  }
};

// Helper function to export todos to JSON file
const exportTodosToFile = (todos: Todo[]): void => {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    todos: todos,
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `todos-${format(new Date(), 'yyyy-MM-dd')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Helper function to validate imported todo data
const isValidTodoData = (data: unknown): boolean => {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.todos)) return false;
  return obj.todos.every((todo: unknown) => {
    if (typeof todo !== 'object' || todo === null) return false;
    const t = todo as Record<string, unknown>;
    return typeof t.id === 'number' && typeof t.text === 'string' && typeof t.completed === 'boolean';
  });
};

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodosFromStorage());
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [view, setView] = useState<ViewType>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save todos to localStorage whenever they change
  useEffect(() => {
    saveTodosToStorage(todos);
  }, [todos]);

  // Handle file import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') {
          setImportError('파일을 읽을 수 없습니다.');
          return;
        }

        const data = JSON.parse(content);
        if (!isValidTodoData(data)) {
          setImportError('잘못된 파일 형식입니다.');
          return;
        }

        const importedTodos: Todo[] = data.todos.map((todo: Todo) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        }));

        // Merge imported todos with existing ones (avoid duplicates by id)
        const existingIds = new Set(todos.map(t => t.id));
        const newTodos = importedTodos.filter(t => !existingIds.has(t.id));
        setImportError(null);
        setTodos([...todos, ...newTodos]);
      } catch (err) {
        setImportError('JSON 파일을 파싱할 수 없습니다.');
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const addTodo = (dueDate?: Date) => {
    if (input.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: input.trim(),
        completed: false,
        createdAt: new Date(),
        dueDate,
      };
      setTodos([newTodo, ...todos]);
      setInput('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const editTodo = (id: number, newText: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  // 날짜별 할 일 수 계산
  const todosByDate = useMemo(() => {
    const map = new Map<string, number>();
    todos.forEach(todo => {
      if (todo.dueDate) {
        const dateKey = format(todo.dueDate, 'yyyy-MM-dd');
        map.set(dateKey, (map.get(dateKey) || 0) + 1);
      }
    });
    return map;
  }, [todos]);

  // 선택된 날짜의 할 일 필터링
  const filteredTodos = useMemo(() => {
    let filtered = todos;

    // 필터 적용
    if (filter === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    }

    // 뷰 적용
    if (view === 'today') {
      filtered = filtered.filter(todo => !todo.dueDate || isToday(todo.dueDate));
    } else if (view === 'scheduled' && selectedDate) {
      filtered = filtered.filter(todo =>
        todo.dueDate && isSameDay(todo.dueDate, selectedDate)
      );
    }

    return filtered;
  }, [todos, filter, view, selectedDate]);

  const activeCount = filteredTodos.filter(todo => !todo.completed).length;
  const completedCount = filteredTodos.filter(todo => todo.completed).length;
  const totalCount = filteredTodos.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const dueDate = view === 'scheduled' ? selectedDate : undefined;
      addTodo(dueDate);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setView('scheduled');
  };

  const handleViewChange = (newView: ViewType) => {
    setView(newView);
    if (newView === 'today') {
      setSelectedDate(new Date());
    }
  };

  const getViewTitle = () => {
    if (view === 'today') return '오늘';
    if (view === 'scheduled') return format(selectedDate, 'M월 d일');
    return '전체';
  };

  return (
    <ThemeProvider>
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[var(--color-bg-gradient-from)] via-[var(--color-bg-gradient-via)] to-[var(--color-bg-gradient-to)]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 -right-20 w-96 h-96 bg-fuchsia-500/30 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-float" />
      </div>

      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      <div className="relative z-10 min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto flex gap-8">
          {/* Sidebar */}
          <aside className="w-80 flex-shrink-0 space-y-6">
            {/* Logo */}
            <div className="bg-white/95 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Todo List</h1>
                  <p className="text-sm text-gray-500">날짜별 할 일 관리</p>
                </div>
              </div>
            </div>

            {/* View Selector */}
            <div className="bg-white/95 rounded-2xl p-4 shadow-xl">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">뷰 선택</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleViewChange('all')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    view === 'all'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-violet-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="font-medium">전체</span>
                  <span className="ml-auto text-sm opacity-75">{todos.length}</span>
                </button>
                <button
                  onClick={() => handleViewChange('today')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    view === 'today'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-violet-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">오늘</span>
                  <span className="ml-auto text-sm opacity-75">
                    {todos.filter(t => !t.dueDate || isToday(t.dueDate)).length}
                  </span>
                </button>
                <button
                  onClick={() => handleViewChange('scheduled')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    view === 'scheduled'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-violet-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">날짜 선택</span>
                </button>
              </div>
            </div>

            {/* Calendar */}
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              todosByDate={todosByDate}
            />

            {/* Stats */}
            <div className="bg-white/95 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">통계</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">전체</span>
                  <span className="font-bold text-gray-800">{todos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">진행중</span>
                  <span className="font-bold text-violet-600">
                    {todos.filter(t => !t.completed).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">완료</span>
                  <span className="font-bold text-emerald-600">
                    {todos.filter(t => t.completed).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Theme Selector */}
            <ThemeSelector />

            {/* Export/Import */}
            <div className="bg-white/95 rounded-2xl p-4 shadow-xl">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">저장 / 내보내기</h3>
              <div className="space-y-2">
                <button
                  onClick={() => exportTodosToFile(todos)}
                  disabled={todos.length === 0}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>JSON 파일로 내보내기</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={handleImportClick}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>JSON 파일 가져오기</span>
                </button>
                {importError && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-lg p-2 mt-2">
                    {importError}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                데이터는 자동으로 로컬 저장소에 저장됩니다
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="glass-strong rounded-3xl p-8 mb-6 shadow-2xl shadow-black/10 animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold gradient-text mb-2">
                    {getViewTitle()}
                  </h2>
                  <p className="text-white/70">
                    {activeCount > 0 && `${activeCount}개 남음 · `}
                    {completedCount > 0 && `${completedCount}개 완료 · `}
                    {totalCount === 0 && '할 일을 추가해보세요 · '}
                    총 {totalCount}개
                  </p>
                </div>
                {view === 'scheduled' && (
                  <button
                    onClick={() => handleViewChange('all')}
                    className="px-4 py-2 bg-white/80 text-violet-600 rounded-lg font-medium hover:bg-white transition-all"
                  >
                    전체 보기
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              {totalCount > 0 && (
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-700 ease-out shadow-lg shadow-emerald-500/30"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="glass-strong rounded-3xl p-6 mb-6 shadow-2xl shadow-black/10 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={view === 'scheduled' ? `새 할 일 (${format(selectedDate, 'M월 d일')})` : '새 할 일을 입력하세요...'}
                    className="input-field w-full"
                  />
                  {input && (
                    <button
                      onClick={() => setInput('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    const dueDate = view === 'scheduled' ? selectedDate : undefined;
                    addTodo(dueDate);
                  }}
                  disabled={!input.trim()}
                  className="btn-primary flex items-center gap-2 px-8"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  추가
                </button>
              </div>
              {view === 'scheduled' && (
                <p className="text-sm text-violet-600 mt-2">
                  이 할 일은 {format(selectedDate, 'yyyy년 M월 d일')}로 예정됩니다
                </p>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="glass rounded-2xl p-2 mb-6 shadow-lg shadow-black/10 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex gap-2">
                {(['all', 'active', 'completed'] as FilterType[]).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`filter-btn ${filter === filterType ? 'active' : ''}`}
                  >
                    {filterType === 'all' && '전체'}
                    {filterType === 'active' && '진행중'}
                    {filterType === 'completed' && '완료'}
                  </button>
                ))}
              </div>
            </div>

            {/* Todo List */}
            <div className="space-y-4 animate-scale-in" style={{ animationDelay: '0.3s' }}>
              {filteredTodos.length === 0 ? (
                <div className="glass-strong rounded-3xl p-16 text-center shadow-2xl shadow-black/10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center shadow-xl shadow-violet-500/30">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    할 일이 없습니다
                  </h3>
                  <p className="text-white/60 text-lg">
                    새 할 일을 추가해서 시작해보세요!
                  </p>
                </div>
              ) : (
                filteredTodos.map((todo, index) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onEdit={editTodo}
                    index={index}
                  />
                ))
              )}
            </div>

            {/* Clear Completed */}
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="mt-8 w-full py-4 glass-strong rounded-2xl font-medium text-violet-600 hover:text-violet-700 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 animate-scale-in"
                style={{ animationDelay: '0.5s' }}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  완료된 항목 모두 삭제 ({completedCount})
                </span>
              </button>
            )}
          </main>
        </div>
      </div>
    </div>
    </ThemeProvider>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  index,
}: {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, text: string) => void;
  index: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(todo.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  const isOverdue = todo.dueDate && isBefore(startOfDay(todo.dueDate), startOfDay(new Date())) && !todo.completed;

  return (
    <div
      className={`todo-item ${todo.completed ? 'opacity-60' : ''} ${isOverdue ? 'ring-2 ring-red-300 ring-opacity-50' : ''}`}
      style={{ animationDelay: `${0.4 + index * 0.05}s` }}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(todo.id)}
          className={`checkbox ${todo.completed ? 'completed' : ''} mt-1`}
          title={todo.completed ? '완료 취소' : '완료'}
        >
          {todo.completed && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="relative">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={handleSave}
                autoFocus
                className="w-full px-4 py-3 bg-violet-50 border-2 border-violet-400 rounded-xl text-lg focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                Enter로 저장, Esc로 취소
              </div>
            </div>
          ) : (
            <>
              <p
                onClick={() => !todo.completed && setIsEditing(true)}
                className={`text-lg leading-relaxed cursor-pointer transition-colors ${
                  todo.completed
                    ? 'text-gray-400 line-through decoration-2 decoration-gray-300'
                    : 'text-gray-800 hover:text-violet-600'
                }`}
              >
                {todo.text}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <p className="text-gray-400">
                  생성: {new Date(todo.createdAt).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {todo.dueDate && (
                  <p className={`flex items-center gap-1 ${
                    isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500'
                  }`}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {format(todo.dueDate, 'M월 d일')}
                    {isOverdue && ' (지연)'}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-1">
          {!todo.completed && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50/50 rounded-xl transition-all duration-200 group"
              title="편집"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(todo.id)}
            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group"
            title="삭제"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}