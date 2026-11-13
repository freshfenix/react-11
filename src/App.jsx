import { useEffect, useState } from 'react'
import { useIdleTimer } from 'react-idle-timer'
import {
  FiActivity,
  FiArrowUpRight,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiDroplet,
  FiHeart,
  FiPlus,
  FiRefreshCw,
  FiSun,
  FiTarget,
  FiWind,
  FiX,
} from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

const STORAGE_KEY = 'dayflow-habits'

const defaultHabits = [
  {
    id: 'water',
    name: 'Випити води',
    description: 'Почати ранок зі склянки води',
    category: 'Здоров’я',
    time: '08:00',
    icon: 'water',
    completed: false,
  },
  {
    id: 'reading',
    name: 'Читати 20 хвилин',
    description: 'Кілька сторінок для себе',
    category: 'Навчання',
    time: '09:30',
    icon: 'book',
    completed: false,
  },
  {
    id: 'breathing',
    name: 'Практика усвідомленості',
    description: 'Зробити паузу та подихати',
    category: 'Ментальність',
    time: '12:00',
    icon: 'wind',
    completed: false,
  },
  {
    id: 'movement',
    name: 'Трохи порухатись',
    description: 'Прогулянка або легка розминка',
    category: 'Здоров’я',
    time: '17:30',
    icon: 'heart',
    completed: false,
  },
]

const habitIcons = {
  water: FiDroplet,
  book: FiBookOpen,
  wind: FiWind,
  heart: FiHeart,
  activity: FiActivity,
}

const categoryIcons = {
  'Здоров’я': 'heart',
  Навчання: 'book',
  Ментальність: 'wind',
  Відпочинок: 'water',
}

const dailyIntentions = [
  {
    title: 'Зробити цей день трохи кращим.',
    description: 'Не потрібно робити все одразу. Просто обери наступний маленький крок.',
    encouragement: 'Ти впораєшся',
    quote: 'Маленькі кроки теж ведуть уперед.',
  },
  {
    title: 'Дати собі час на відпочинок.',
    description: 'Пауза — це теж частина шляху. Прислухайся до себе.',
    encouragement: 'Твій темп — правильний',
    quote: 'Турбота про себе починається з уваги.',
  },
  {
    title: 'Спробувати, не чекаючи ідеального моменту.',
    description: 'Одна спроба важить більше за безліч відкладених планів.',
    encouragement: 'Почни з малого',
    quote: 'Послідовність виростає з одного рішення.',
  },
  {
    title: 'Помічати те, що вже вдалося.',
    description: 'Зупинись на мить і віддай належне своїм маленьким перемогам.',
    encouragement: 'Ти вже рухаєшся',
    quote: 'Прогрес — це те, що ти робиш сьогодні.',
  },
]

function getTodayKey() {
  const date = new Date()
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

function readHabits() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultHabits

    const parsed = JSON.parse(saved)
    if (parsed.date === getTodayKey() && Array.isArray(parsed.habits)) {
      return parsed.habits
    }
  } catch (error) {
    console.error('Не вдалося завантажити звички з локального сховища.', error)
  }

  return defaultHabits
}

function App() {
  const [habits, setHabits] = useState(readHabits)
  const [filter, setFilter] = useState('Усі')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitCategory, setNewHabitCategory] = useState('Здоров’я')
  const [isIdle, setIsIdle] = useState(false)
  const [intentionIndex, setIntentionIndex] = useState(0)
  const [dateLabel] = useState(() =>
    new Intl.DateTimeFormat('uk-UA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date()),
  )

  const completedCount = habits.filter((habit) => habit.completed).length
  const progress = habits.length ? Math.round((completedCount / habits.length) * 100) : 0
  const intention = dailyIntentions[intentionIndex]
  const visibleHabits = habits.filter((habit) => {
    if (filter === 'Виконані') return habit.completed
    if (filter === 'У плані') return !habit.completed
    return true
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: getTodayKey(), habits }),
      )
    } catch (error) {
      console.error('Не вдалося зберегти звички в локальному сховищі.', error)
      toast.error('Не вдалося зберегти зміни. Перевірте налаштування сховища браузера.')
    }
  }, [habits])

  useEffect(() => {
    if (!isAddModalOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsAddModalOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAddModalOpen])

  useIdleTimer({
    timeout: 5 * 60 * 1000,
    onIdle: () => {
      setIsIdle(true)
      toast.info('Невелика пауза — твої звички збережені. Повертайся, коли будеш готовий(-а).', {
        toastId: 'idle-reminder',
      })
    },
    onActive: () => setIsIdle(false),
    debounce: 500,
  })

  function toggleHabit(id) {
    const habit = habits.find((item) => item.id === id)
    if (!habit) return

    setHabits((currentHabits) =>
      currentHabits.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    )
    toast.success(habit.completed ? 'Звичку повернуто до плану' : 'Чудово! Ще один крок зроблено ✨')
  }

  function addHabit(event) {
    event.preventDefault()
    const name = newHabitName.trim()
    if (!name) return

    setHabits((currentHabits) => [
      ...currentHabits,
      {
        id: `${Date.now()}`,
        name,
        description: 'Твоя нова маленька перемога',
        category: newHabitCategory,
        time: 'Без часу',
        icon: categoryIcons[newHabitCategory] || 'activity',
        completed: false,
      },
    ])
    setNewHabitName('')
    setIsAddModalOpen(false)
    toast.success('Нову звичку додано до плану')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Dayflow — на головну">
          <span className="brand-mark"><FiSun aria-hidden="true" /></span>
          <span>dayflow<span className="brand-dot">.</span></span>
        </a>

        <div className="workspace-label">ТВІЙ ПРОСТІР</div>
        <nav className="side-nav" aria-label="Головна навігація">
          <a className="nav-item active" href="#overview">
            <FiActivity aria-hidden="true" />
            <span>Огляд дня</span>
            <span className="nav-indicator" />
          </a>
          <a className="nav-item" href="#habits">
            <FiCheckCircle aria-hidden="true" />
            <span>Мої звички</span>
            <span className="nav-count">{habits.length}</span>
          </a>
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <span className="note-icon"><FiHeart aria-hidden="true" /></span>
          <p>Послідовність важливіша за досконалість.</p>
          <span className="note-caption">Нагадування для себе</span>
        </div>
        <div className="profile-card">
          <div className="profile-avatar">М</div>
          <div className="profile-copy">
            <strong>Мій простір</strong>
            <span>Маленькі кроки щодня</span>
          </div>
          <FiChevronRight className="profile-chevron" aria-hidden="true" />
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb"><span>Мій простір</span><FiChevronRight aria-hidden="true" /><strong>Огляд дня</strong></div>
          <div className={`save-status${isIdle ? ' idle' : ''}`}>
            <span className="status-dot" />
            {isIdle ? 'Пауза' : 'Прогрес збережено'}
          </div>
        </header>

        <div className="content-grid">
          <section className="dashboard-column">
            <section className="welcome-section">
              <div className="date-label"><span className="date-sparkle">✳</span>{dateLabel}</div>
              <h1>Привіт, Міро<span className="wave">✦</span></h1>
              <p>Кожен маленький крок наближає тебе до великої мети.</p>
            </section>

            <section className="progress-card" aria-label="Прогрес за сьогодні">
              <div className="progress-copy">
                <span className="eyebrow">ТВІЙ РИТМ СЬОГОДНІ</span>
                <h2>{completedCount === habits.length && habits.length ? 'День у твоїх руках!' : 'Крок за кроком'}</h2>
                <p>Виконано <strong>{completedCount} з {habits.length}</strong> запланованих звичок</p>
                <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" aria-label="Виконання звичок">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <span className="progress-caption">{progress}% денного плану</span>
              </div>
              <div className="progress-ring" style={{ '--progress': `${progress}%` }} aria-label={`${progress}% виконано`}>
                <div><strong>{progress}<span>%</span></strong><small>готово</small></div>
              </div>
              <div className="progress-decoration decoration-one" />
              <div className="progress-decoration decoration-two" />
            </section>

            <section className="habits-section" id="habits">
              <div className="section-heading">
                <div>
                  <div className="section-title-row">
                    <h2>Твої звички</h2>
                    <span className="habit-total">{habits.length}</span>
                  </div>
                  <p>Твій план на сьогодні — без поспіху</p>
                </div>
                <button className="add-button" type="button" onClick={() => setIsAddModalOpen(true)}>
                  <FiPlus aria-hidden="true" />
                  <span>Нова звичка</span>
                </button>
              </div>

              <div className="filter-row" role="group" aria-label="Фільтр звичок">
                {['Усі', 'У плані', 'Виконані'].map((option) => (
                  <button
                    className={`filter-chip${filter === option ? ' selected' : ''}`}
                    key={option}
                    type="button"
                    aria-pressed={filter === option}
                    onClick={() => setFilter(option)}
                  >
                    {option}
                    {option === 'Усі' && <span>{habits.length}</span>}
                    {option === 'У плані' && <span>{habits.length - completedCount}</span>}
                    {option === 'Виконані' && <span>{completedCount}</span>}
                  </button>
                ))}
              </div>

              <div className="habit-list">
                {visibleHabits.map((habit, index) => {
                  const Icon = habitIcons[habit.icon] || FiTarget
                  return (
                    <article className={`habit-card${habit.completed ? ' completed' : ''}`} key={habit.id}>
                      <div className={`habit-icon icon-tone-${index % 4}`}><Icon aria-hidden="true" /></div>
                      <div className="habit-info">
                        <div className="habit-name-row">
                          <h3>{habit.name}</h3>
                          {habit.completed && <span className="done-label">Виконано</span>}
                        </div>
                        <p>{habit.description}</p>
                        <div className="habit-meta">
                          <span className="category-tag">{habit.category}</span>
                          <span className="habit-time"><FiClock aria-hidden="true" />{habit.time}</span>
                        </div>
                      </div>
                      <button
                        className={`check-button${habit.completed ? ' checked' : ''}`}
                        type="button"
                        aria-label={habit.completed ? `Скасувати: ${habit.name}` : `Відмітити виконаною: ${habit.name}`}
                        aria-pressed={habit.completed}
                        onClick={() => toggleHabit(habit.id)}
                      >
                        {habit.completed && <FiCheck aria-hidden="true" />}
                      </button>
                    </article>
                  )
                })}
                {visibleHabits.length === 0 && (
                  <div className="empty-state">
                    <span><FiCheckCircle aria-hidden="true" /></span>
                    <strong>{filter === 'Виконані' ? 'Поки що нічого не виконано' : 'Усе заплановане зроблено!'}</strong>
                    <p>{filter === 'Виконані' ? 'Виконай першу звичку — і вона з’явиться тут.' : 'Можеш перепочити або додати нову звичку.'}</p>
                  </div>
                )}
              </div>
            </section>
          </section>

          <aside className="insights-column" aria-label="Підказки та статистика">
            <div className="side-card intention-card">
              <div className="side-card-heading">
                <div className="side-icon sun-icon"><FiSun aria-hidden="true" /></div>
                <span>ТВОЯ ЩОДЕННА ПІДТРИМКА</span>
              </div>
              <div className="intention-copy" aria-live="polite" aria-atomic="true">
                <h3 key={`intention-${intentionIndex}`}>{intention.title}</h3>
                <p>{intention.description}</p>
              </div>
              <div className="intention-footer">
                <span>{intention.encouragement}</span>
                <button
                  aria-label="Показати інше нагадування"
                  className="intention-refresh"
                  onClick={() => setIntentionIndex((current) => (current + 1) % dailyIntentions.length)}
                  title="Показати інше нагадування"
                  type="button"
                >
                  <FiRefreshCw aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="side-card focus-card">
              <div className="side-card-heading">
                <div className="side-icon target-icon"><FiTarget aria-hidden="true" /></div>
                <span>ФОКУС ДНЯ</span>
              </div>
              <div className="focus-number">{completedCount}<span>/{habits.length}</span></div>
              <p>звичок уже зараховано</p>
              <div className="focus-mini-progress">
                {habits.map((habit) => (
                  <span className={habit.completed ? 'filled' : ''} key={habit.id} />
                ))}
              </div>
              <div className="focus-footer">
                <span>{completedCount === habits.length && habits.length ? 'Денну ціль досягнуто' : 'У тебе все виходить'}</span>
                <FiArrowUpRight aria-hidden="true" />
              </div>
            </div>

            <div className="idle-tip">
              <span className="idle-tip-icon"><FiClock aria-hidden="true" /></span>
              <div><strong>Турбота про баланс</strong><p>Після 5 хвилин бездіяльності ми нагадаємо, що можна зробити паузу.</p></div>
            </div>

            <div className="quote-card">
              <span className="quote-mark">“</span>
              <p aria-live="polite" aria-atomic="true" key={`quote-${intentionIndex}`}>{intention.quote}</p>
              <span className="quote-author">— Нагадування Dayflow</span>
            </div>
          </aside>
        </div>

        <footer className="page-footer"><span>З турботою про твій ритм</span><span>dayflow <span className="footer-sparkle">✳</span></span></footer>
      </main>

      {isAddModalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsAddModalOpen(false)
        }}>
          <section className="habit-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button className="modal-close" type="button" aria-label="Закрити" onClick={() => setIsAddModalOpen(false)}><FiX /></button>
            <div className="modal-icon"><FiPlus aria-hidden="true" /></div>
            <span className="eyebrow">МАЛЕНЬКИЙ КРОК</span>
            <h2 id="modal-title">Додати звичку</h2>
            <p className="modal-description">Обери одну просту дію, яку хочеш зробити частиною свого дня.</p>
            <form onSubmit={addHabit}>
              <label htmlFor="habit-name">Назва звички</label>
              <input
                autoFocus
                id="habit-name"
                maxLength={60}
                onChange={(event) => setNewHabitName(event.target.value)}
                placeholder="Наприклад, зробити розминку"
                required
                value={newHabitName}
              />
              <label htmlFor="habit-category">Категорія</label>
              <select id="habit-category" onChange={(event) => setNewHabitCategory(event.target.value)} value={newHabitCategory}>
                {Object.keys(categoryIcons).map((category) => <option key={category}>{category}</option>)}
              </select>
              <div className="modal-actions">
                <button className="cancel-button" type="button" onClick={() => setIsAddModalOpen(false)}>Скасувати</button>
                <button className="submit-button" type="submit"><FiPlus aria-hidden="true" />Додати звичку</button>
              </div>
            </form>
          </section>
        </div>
      )}

      <ToastContainer
        autoClose={3200}
        closeOnClick
        newestOnTop
        pauseOnFocusLoss
        position="bottom-right"
        theme="light"
      />
    </div>
  )
}

export default App
