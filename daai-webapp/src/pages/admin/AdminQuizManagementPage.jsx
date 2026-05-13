import { useEffect, useMemo, useState } from 'react'
import {
  createAdminQuizQuestion,
  getAdminQuizPerformance,
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
  const [performance, setPerformance] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingQuestionId, setEditingQuestionId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const groupedQuestions = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        questions: questions.filter((question) => question.category === category.slug),
      })),
    [categories, questions],
  )

  useEffect(() => {
    let isMounted = true

    const loadAdminQuizData = async () => {
      try {
        const [categoryData, questionData, performanceData] = await Promise.all([
          getQuizCategories(),
          getAdminQuizQuestions(),
          getAdminQuizPerformance(),
        ])

        if (isMounted) {
          setCategories(categoryData)
          setQuestions(questionData)
          setPerformance(performanceData)
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
    const [questionData, performanceData] = await Promise.all([
      getAdminQuizQuestions(),
      getAdminQuizPerformance(),
    ])
    setQuestions(questionData)
    setPerformance(performanceData)
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

  const resetForm = () => {
    setEditingQuestionId('')
    setForm({
      ...emptyForm,
      category: categories[0]?.slug ?? '',
    })
    setError('')
    setSuccessMessage('')
  }

  const handleEdit = (question) => {
    setEditingQuestionId(question.id)
    setForm(toFormState(question))
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

      resetForm()
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
      <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
          Quiz Management
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#24140e]">
          Manage quiz questions
        </h1>
        <p className="mt-3 text-sm font-medium text-[#6f5f57]">
          Create, edit, activate, deactivate, and review quiz performance.
        </p>
      </div>

      {isLoading ? (
        <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">
          Loading quiz management...
        </p>
      ) : null}

      {error ? (
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
          <div className="grid gap-4 xl:grid-cols-4">
            {performance.map((item) => (
              <article
                key={item.category}
                className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]"
              >
                <h2 className="text-lg font-black text-[#24140e]">
                  {item.category_title}
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <p className="rounded-md bg-[#fff1e8] p-3 font-bold">
                    Attempts
                    <span className="mt-1 block text-2xl font-black text-[#24140e]">
                      {item.attempts}
                    </span>
                  </p>
                  <p className="rounded-md bg-green-50 p-3 font-bold">
                    Avg
                    <span className="mt-1 block text-2xl font-black text-[#24140e]">
                      {item.average_percentage}%
                    </span>
                  </p>
                  <p className="rounded-md bg-orange-50 p-3 font-bold">
                    Pass rate
                    <span className="mt-1 block text-2xl font-black text-[#24140e]">
                      {item.pass_rate}%
                    </span>
                  </p>
                  <p className="rounded-md bg-red-50 p-3 font-bold">
                    Active
                    <span className="mt-1 block text-2xl font-black text-[#24140e]">
                      {item.active_questions}/{item.total_questions}
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(320px,420px)_1fr]">
            <form
              className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]"
              onSubmit={handleSubmit}
            >
              <h2 className="text-xl font-black text-[#24140e]">
                {editingQuestionId ? 'Edit question' : 'Create question'}
              </h2>

              <label className="mt-4 block text-sm font-black text-[#24140e]">
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={handleFieldChange}
                  className="mt-2 w-full rounded-md border border-orange-100 bg-white px-3 py-2 text-sm font-semibold text-[#24140e]"
                  required
                >
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 block text-sm font-black text-[#24140e]">
                Question
                <textarea
                  name="question"
                  value={form.question}
                  onChange={handleFieldChange}
                  className="mt-2 min-h-24 w-full rounded-md border border-orange-100 bg-white px-3 py-2 text-sm font-semibold text-[#24140e]"
                  required
                />
              </label>

              <label className="mt-4 block text-sm font-black text-[#24140e]">
                Options
                <textarea
                  name="optionsText"
                  value={form.optionsText}
                  onChange={handleFieldChange}
                  className="mt-2 min-h-32 w-full rounded-md border border-orange-100 bg-white px-3 py-2 text-sm font-semibold text-[#24140e]"
                  required
                />
              </label>

              <label className="mt-4 block text-sm font-black text-[#24140e]">
                Correct answer
                <input
                  name="correct_answer"
                  value={form.correct_answer}
                  onChange={handleFieldChange}
                  className="mt-2 w-full rounded-md border border-orange-100 bg-white px-3 py-2 text-sm font-semibold text-[#24140e]"
                  required
                />
              </label>

              <label className="mt-4 block text-sm font-black text-[#24140e]">
                Explanation
                <textarea
                  name="explanation"
                  value={form.explanation}
                  onChange={handleFieldChange}
                  className="mt-2 min-h-24 w-full rounded-md border border-orange-100 bg-white px-3 py-2 text-sm font-semibold text-[#24140e]"
                />
              </label>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-black text-[#24140e]">
                  Difficulty
                  <select
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleFieldChange}
                    className="mt-2 w-full rounded-md border border-orange-100 bg-white px-3 py-2 text-sm font-semibold text-[#24140e]"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                  </select>
                </label>
                <label className="mt-7 flex items-center gap-2 text-sm font-black text-[#24140e]">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleFieldChange}
                    className="accent-[#f26322]"
                  />
                  Active
                </label>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-md bg-[#f26322] px-4 py-2 text-sm font-black text-white transition hover:bg-[#d94f13] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving
                    ? 'Saving...'
                    : editingQuestionId
                      ? 'Update Question'
                      : 'Create Question'}
                </button>
                {editingQuestionId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-md border border-orange-100 bg-white px-4 py-2 text-sm font-black text-[#f26322] transition hover:bg-[#fff1e8]"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>

            <div className="space-y-4">
              {groupedQuestions.map((group) => (
                <section
                  key={group.slug}
                  className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
                        {group.difficulty_label}
                      </p>
                      <h2 className="text-xl font-black text-[#24140e]">
                        {group.title}
                      </h2>
                    </div>
                    <span className="rounded-full bg-[#fff1e8] px-3 py-1 text-xs font-black text-[#f26322]">
                      {group.questions.length} questions
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {group.questions.map((question) => (
                      <article
                        key={question.id}
                        className="rounded-md border border-orange-100 bg-[#fff8f3] p-4"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap gap-2">
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
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#6f5f57]">
                                {question.difficulty}
                              </span>
                            </div>
                            <p className="mt-3 text-sm font-black text-[#24140e]">
                              {question.question}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-green-700">
                              Correct: {question.correct_answer}
                            </p>
                            <p className="mt-2 text-sm font-medium text-[#6f5f57]">
                              {question.explanation || 'No explanation added.'}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(question)}
                              className="rounded-md bg-[#f26322] px-3 py-2 text-xs font-black text-white transition hover:bg-[#d94f13]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(question)}
                              className="rounded-md border border-orange-100 bg-white px-3 py-2 text-xs font-black text-[#f26322] transition hover:bg-[#fff1e8]"
                            >
                              {question.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
