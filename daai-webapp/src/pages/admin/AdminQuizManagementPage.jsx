import { useEffect, useMemo, useState } from 'react'
import {
  createAdminQuizQuestion,
  getAdminQuizQuestions,
  getQuizCategories,
  updateAdminQuizQuestion,
  updateAdminQuizQuestionStatus,
} from '../../services/quizService'

const emptyForm = {
  category: '',
  question: '',
  optionsText: '',
  correct_answer: '',
  explanation: '',
  difficulty: 'easy',
  is_active: true,
}

const formatOptions = (optionsText) =>
  optionsText
    .split('\n')
    .map((option) => option.trim())
    .filter(Boolean)

const toFormState = (question) => ({
  category: question.category,
  question: question.question,
  optionsText: question.options.join('\n'),
  correct_answer: question.correct_answer,
  explanation: question.explanation,
  difficulty: question.difficulty,
  is_active: question.is_active,
})

export default function AdminQuizManagementPage() {
  const [categories, setCategories] = useState([])
  const [questions, setQuestions] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingQuestionId, setEditingQuestionId] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: '',
  })

  const categoryBySlug = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [category.slug, category]),
      ),
    [categories],
  )

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase()

    return questions.filter((question) => {
      const matchesCategory =
        filters.category === 'all' || question.category === filters.category
      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'active' && question.is_active) ||
        (filters.status === 'inactive' && !question.is_active)
      const searchableText = [
        question.question,
        categoryBySlug[question.category]?.title,
        question.correct_answer,
        question.explanation,
        ...question.options,
      ]
        .join(' ')
        .toLowerCase()
      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch)

      return matchesCategory && matchesStatus && matchesSearch
    })
  }, [categoryBySlug, filters, questions])

  useEffect(() => {
    let isMounted = true

    const loadAdminQuizData = async () => {
      try {
        const [categoryData, questionData] = await Promise.all([
          getQuizCategories(),
          getAdminQuizQuestions(),
        ])

        if (isMounted) {
          setCategories(categoryData)
          setQuestions(questionData)
          setForm((currentForm) => ({
            ...currentForm,
            category: categoryData[0]?.slug ?? '',
          }))
        }
      } catch {
        if (isMounted) {
          setError('Unable to load quiz management data.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAdminQuizData()

    return () => {
      isMounted = false
    }
  }, [])

  const refreshAdminData = async () => {
    const questionData = await getAdminQuizQuestions()
    setQuestions(questionData)
  }

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setError('')
    setSuccessMessage('')
  }

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  const resetFilters = () => {
    setFilters({
      category: 'all',
      status: 'all',
      search: '',
    })
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingQuestionId('')
    setForm({
      ...emptyForm,
      category: categories[0]?.slug ?? '',
    })
    setError('')
    setSuccessMessage('')
  }

  const openCreateForm = () => {
    setEditingQuestionId('')
    setForm({
      ...emptyForm,
      category: categories[0]?.slug ?? '',
    })
    setIsFormOpen(true)
    setError('')
    setSuccessMessage('')
  }

  const openEditForm = (question) => {
    setEditingQuestionId(question.id)
    setForm(toFormState(question))
    setIsFormOpen(true)
    setError('')
    setSuccessMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const options = formatOptions(form.optionsText)
    if (!options.includes(form.correct_answer.trim())) {
      setError('Correct answer must exactly match one of the options.')
      return
    }

    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    const payload = {
      category: form.category,
      question: form.question.trim(),
      options,
      correct_answer: form.correct_answer.trim(),
      explanation: form.explanation.trim(),
      difficulty: form.difficulty,
      is_active: form.is_active,
    }

    try {
      if (editingQuestionId) {
        await updateAdminQuizQuestion(editingQuestionId, payload)
        setSuccessMessage('Question updated.')
      } else {
        await createAdminQuizQuestion(payload)
        setSuccessMessage('Question created.')
      }

      closeForm()
      await refreshAdminData()
    } catch (submitError) {
      const detail = submitError?.response?.data?.detail
      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to save quiz question. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusToggle = async (question) => {
    setError('')
    setSuccessMessage('')

    try {
      await updateAdminQuizQuestionStatus(question.id, !question.is_active)
      setSuccessMessage(
        question.is_active ? 'Question deactivated.' : 'Question activated.',
      )
      await refreshAdminData()
    } catch {
      setError('Unable to update question status.')
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
              Quiz Management
            </p>
            <h1 className="mt-2 text-3xl font-black text-[#0f172a]">
              Manage quiz questions
            </h1>
            <p className="mt-3 text-sm font-medium text-[#475569]">
              Create, edit, activate, deactivate, and review quiz performance.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-md bg-[#4f46e5] px-5 py-3 text-sm font-black text-white transition hover:bg-[#4338ca]"
          >
            + Create Question
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold">
          Loading quiz management...
        </p>
      ) : null}

      {error && !isFormOpen ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">
          {successMessage}
        </p>
      ) : null}

      {!isLoading ? (
        <>
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#0f172a]">
                  Question library
                </h2>
                <p className="mt-1 text-sm font-medium text-[#475569]">
                  Showing {filteredQuestions.length} of {questions.length} questions
                </p>
              </div>

              <div className="grid w-full gap-3 lg:grid-cols-[1.3fr_0.8fr_0.8fr_auto] xl:max-w-4xl">
                <label className="block text-sm font-black text-[#0f172a]">
                  Search
                  <input
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Question, option, answer"
                    className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#0f172a]"
                  />
                </label>
                <label className="block text-sm font-black text-[#0f172a]">
                  Category
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#0f172a]"
                  >
                    <option value="all">All categories</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-black text-[#0f172a]">
                  Status
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#0f172a]"
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active only</option>
                    <option value="inactive">Inactive only</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-7 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-black text-[#4f46e5] transition hover:bg-[#eef2ff]"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
              <div className="hidden grid-cols-[1.5fr_0.75fr_0.65fr_0.65fr_1fr_0.9fr] gap-4 bg-[#f8fafc] px-4 py-3 text-xs font-black uppercase tracking-wide text-[#475569] xl:grid">
                <span>Question</span>
                <span>Category</span>
                <span>Difficulty</span>
                <span>Status</span>
                <span>Correct Answer</span>
                <span>Actions</span>
              </div>

              {filteredQuestions.length === 0 ? (
                <p className="p-5 text-sm font-bold text-[#475569]">
                  No questions match the selected filters.
                </p>
              ) : null}

              {filteredQuestions.map((question) => (
                <article
                  key={question.id}
                  className="border-t border-slate-200 bg-white p-4 first:border-t-0 xl:grid xl:grid-cols-[1.5fr_0.75fr_0.65fr_0.65fr_1fr_0.9fr] xl:items-center xl:gap-4"
                >
                  <div>
                    <p className="text-sm font-black text-[#0f172a]">
                      {question.question}
                    </p>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#475569] xl:mt-0">
                    <span className="font-black text-[#0f172a] xl:hidden">
                      Category:{' '}
                    </span>
                    {categoryBySlug[question.category]?.title ?? question.category}
                  </p>
                  <div className="mt-3 xl:mt-0">
                    <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-black text-[#475569]">
                      {question.difficulty}
                    </span>
                  </div>
                  <div className="mt-3 xl:mt-0">
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-xs font-black',
                        question.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700',
                      ].join(' ')}
                    >
                      {question.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="mt-3 truncate text-sm font-semibold text-green-700 xl:mt-0">
                    <span className="font-black text-[#0f172a] xl:hidden">
                      Correct:{' '}
                    </span>
                    {question.correct_answer}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 xl:mt-0">
                    <button
                      type="button"
                      onClick={() => setSelectedQuestion(question)}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-black text-[#4f46e5] transition hover:bg-[#eef2ff]"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditForm(question)}
                      className="rounded-md bg-[#4f46e5] px-3 py-2 text-xs font-black text-white transition hover:bg-[#4338ca]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(question)}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-black text-[#4f46e5] transition hover:bg-[#eef2ff]"
                    >
                      {question.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 bg-[#0f172a]/40">
          <div className="ml-auto flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white p-5 shadow-[-20px_0_50px_-30px_rgba(36,20,14,0.5)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
                  {editingQuestionId ? 'Edit Question' : 'Create Question'}
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#0f172a]">
                  {editingQuestionId ? 'Update quiz question' : 'New quiz question'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-black text-[#4f46e5] transition hover:bg-[#eef2ff]"
              >
                Cancel
              </button>
            </div>

            {error ? (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
                {error}
              </p>
            ) : null}

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm font-black text-[#0f172a]">
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={handleFieldChange}
                  className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#0f172a]"
                  required
                >
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-black text-[#0f172a]">
                Question
                <textarea
                  name="question"
                  value={form.question}
                  onChange={handleFieldChange}
                  className="mt-2 min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#0f172a]"
                  required
                />
              </label>

              <label className="block text-sm font-black text-[#0f172a]">
                Options
                <textarea
                  name="optionsText"
                  value={form.optionsText}
                  onChange={handleFieldChange}
                  className="mt-2 min-h-32 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#0f172a]"
                  required
                />
              </label>

              <label className="block text-sm font-black text-[#0f172a]">
                Correct answer
                <input
                  name="correct_answer"
                  value={form.correct_answer}
                  onChange={handleFieldChange}
                  className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#0f172a]"
                  required
                />
              </label>

              <label className="block text-sm font-black text-[#0f172a]">
                Explanation
                <textarea
                  name="explanation"
                  value={form.explanation}
                  onChange={handleFieldChange}
                  className="mt-2 min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#0f172a]"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-black text-[#0f172a]">
                  Difficulty
                  <select
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleFieldChange}
                    className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#0f172a]"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                  </select>
                </label>
                <label className="mt-7 flex items-center gap-2 text-sm font-black text-[#0f172a]">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleFieldChange}
                    className="accent-indigo-600"
                  />
                  Active
                </label>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-md bg-[#4f46e5] px-5 py-3 text-sm font-black text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? 'Saving...' : 'Save Question'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#4f46e5] transition hover:bg-[#eef2ff]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedQuestion ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-5 shadow-[0_24px_70px_-35px_rgba(36,20,14,0.65)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
                  Question Details
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#0f172a]">
                  {categoryBySlug[selectedQuestion.category]?.title ??
                    selectedQuestion.category}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-black text-[#4f46e5] transition hover:bg-[#eef2ff]"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-black text-[#475569]">
                {selectedQuestion.difficulty}
              </span>
              <span
                className={[
                  'rounded-full px-3 py-1 text-xs font-black',
                  selectedQuestion.is_active
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700',
                ].join(' ')}
              >
                {selectedQuestion.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="mt-5 text-lg font-black text-[#0f172a]">
              {selectedQuestion.question}
            </p>

            <div className="mt-5">
              <h3 className="text-sm font-black uppercase tracking-wide text-[#4f46e5]">
                Options
              </h3>
              <ol className="mt-3 space-y-2">
                {selectedQuestion.options.map((option, optionIndex) => (
                  <li
                    key={option}
                    className={[
                      'rounded-md border px-4 py-3 text-sm font-semibold',
                      option === selectedQuestion.correct_answer
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-slate-200 bg-white text-[#475569]',
                    ].join(' ')}
                  >
                    <span className="mr-2 font-black">{optionIndex + 1}.</span>
                    {option}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-5 rounded-md border border-slate-200 bg-[#f8fafc] p-4">
              <p className="text-sm font-black text-[#0f172a]">
                Correct answer
              </p>
              <p className="mt-1 text-sm font-semibold text-green-700">
                {selectedQuestion.correct_answer}
              </p>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-black uppercase tracking-wide text-[#4f46e5]">
                Explanation
              </h3>
              <p className="mt-2 text-sm font-medium text-[#475569]">
                {selectedQuestion.explanation || 'No explanation added.'}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
