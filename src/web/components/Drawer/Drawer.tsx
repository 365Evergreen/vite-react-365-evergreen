import { useEffect, useState } from 'react'
import Form from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'
import type { RJSFSchema, UiSchema } from '@rjsf/utils'
import { apiBase } from '../../../api/apiBase'
import { useAsyncData } from '../../lib/useAsyncData'
import styles from './Drawer.module.css'

type GetInTouchProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
}

type GetInTouchFieldType =
  | 'text'
  | 'email'
  | 'date'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox-group'
  | 'file'
  | 'rating'
  | 'toggle'

interface GetInTouchFieldOption {
  label: string
  value: string
}

interface GetInTouchFieldDefinition {
  id: string
  type: GetInTouchFieldType
  label: string
  required?: boolean
  placeholder?: string
  rows?: number
  max?: number
  acceptedTypes?: string[]
  options?: GetInTouchFieldOption[]
}

interface GetInTouchStepDefinition {
  id: string
  title: string
  description?: string
  fields: GetInTouchFieldDefinition[]
}

interface GetInTouchFormDefinition {
  id: string
  title: string
  description?: string
  submitButtonText?: string
  steps: GetInTouchStepDefinition[]
}

const GetInTouch_FORM_URL = new URL('./00002.json', import.meta.url).toString()
let GetInTouchFormPromise: Promise<GetInTouchFormDefinition> | null = null

function normalizeGetInTouchForm(payload: unknown): GetInTouchFormDefinition {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('GetInTouch form definition is invalid')
  }

  const raw = payload as Record<string, unknown>
  const id = typeof raw.id === 'string' ? raw.id : 'GetInTouch-form'
  const title = typeof raw.title === 'string' ? raw.title : 'GetInTouch form'
  const description = typeof raw.description === 'string' ? raw.description : undefined
  const submitButtonText = typeof raw.submitButtonText === 'string' ? raw.submitButtonText : undefined
  const rawSteps = Array.isArray(raw.steps) ? raw.steps : []

  const steps = rawSteps
    .map((step, stepIndex): GetInTouchStepDefinition | null => {
      if (typeof step !== 'object' || step === null) return null
      const stepRecord = step as Record<string, unknown>
      const rawFields = Array.isArray(stepRecord.fields) ? stepRecord.fields : []
      const fields = rawFields
        .map((field, fieldIndex): GetInTouchFieldDefinition | null => {
          if (typeof field !== 'object' || field === null) return null
          const fieldRecord = field as Record<string, unknown>
          const fieldId = typeof fieldRecord.id === 'string' ? fieldRecord.id : `field-${fieldIndex + 1}`
          const fieldType =
            typeof fieldRecord.type === 'string' ? (fieldRecord.type as GetInTouchFieldType) : 'text'
          const label = typeof fieldRecord.label === 'string' ? fieldRecord.label : fieldId
          const options = Array.isArray(fieldRecord.options)
            ? fieldRecord.options
              .map((option): GetInTouchFieldOption | null => {
                if (typeof option !== 'object' || option === null) return null
                const optionRecord = option as Record<string, unknown>
                const optionLabel = typeof optionRecord.label === 'string' ? optionRecord.label : undefined
                const optionValue = typeof optionRecord.value === 'string' ? optionRecord.value : undefined
                if (!optionLabel || !optionValue) return null
                return { label: optionLabel, value: optionValue }
              })
              .filter((option): option is GetInTouchFieldOption => option !== null)
            : undefined

          return {
            id: fieldId,
            type: fieldType,
            label,
            required: fieldRecord.required === true,
            placeholder: typeof fieldRecord.placeholder === 'string' ? fieldRecord.placeholder : undefined,
            rows: typeof fieldRecord.rows === 'number' ? fieldRecord.rows : undefined,
            max: typeof fieldRecord.max === 'number' ? fieldRecord.max : undefined,
            acceptedTypes: Array.isArray(fieldRecord.acceptedTypes)
              ? fieldRecord.acceptedTypes.filter((item): item is string => typeof item === 'string')
              : undefined,
            options,
          }
        })
        .filter((field): field is GetInTouchFieldDefinition => field !== null)

      return {
        id: typeof stepRecord.id === 'string' ? stepRecord.id : `step-${stepIndex + 1}`,
        title: typeof stepRecord.title === 'string' ? stepRecord.title : `Step ${stepIndex + 1}`,
        description: typeof stepRecord.description === 'string' ? stepRecord.description : undefined,
        fields,
      }
    })
    .filter((step): step is GetInTouchStepDefinition => step !== null)

  return { id, title, description, submitButtonText, steps }
}

async function loadGetInTouchFormDefinition(): Promise<GetInTouchFormDefinition> {
  if (!GetInTouchFormPromise) {
    GetInTouchFormPromise = fetch(GetInTouch_FORM_URL, { headers: { Accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load GetInTouch form (HTTP ${response.status})`)
        }
        return response.json() as Promise<unknown>
      })
      .then((payload) => normalizeGetInTouchForm(payload))
  }

  return GetInTouchFormPromise
}

function toRjsf(definition: GetInTouchFormDefinition): { schema: RJSFSchema; uiSchema: UiSchema } {
  const properties: Record<string, RJSFSchema> = {}
  const required: string[] = []
  const uiSchema: UiSchema = {}

  for (const step of definition.steps) {
    for (const field of step.fields) {
      const key = `${step.id}_${field.id}`
      const sharedDescription = field.acceptedTypes?.length
        ? `Accepted file types: ${field.acceptedTypes.join(', ')}`
        : undefined

      if (field.required) {
        required.push(key)
      }

      switch (field.type) {
        case 'email':
          properties[key] = { type: 'string', format: 'email', title: field.label, description: sharedDescription }
          break
        case 'date':
          properties[key] = { type: 'string', format: 'date', title: field.label, description: sharedDescription }
          break
        case 'textarea':
          properties[key] = { type: 'string', title: field.label, description: sharedDescription }
          uiSchema[key] = { 'ui:widget': 'textarea', 'ui:options': { rows: field.rows ?? 4 } }
          break
        case 'select':
        case 'radio':
          properties[key] = {
            type: 'string',
            title: field.label,
            oneOf: (field.options ?? []).map((option) => ({
              const: option.value,
              title: option.label,
            })),
            description: sharedDescription,
          }
          if (field.type === 'radio') {
            uiSchema[key] = { 'ui:widget': 'radio' }
          }
          break
        case 'checkbox-group':
          properties[key] = {
            type: 'array',
            title: field.label,
            items: {
              type: 'string',
              oneOf: (field.options ?? []).map((option) => ({
                const: option.value,
                title: option.label,
              })),
            },
            uniqueItems: true,
            description: sharedDescription,
          }
          uiSchema[key] = { 'ui:widget': 'checkboxes' }
          break
        case 'toggle':
          properties[key] = { type: 'boolean', title: field.label, description: sharedDescription }
          break
        case 'rating':
          properties[key] = {
            type: 'integer',
            title: field.label,
            minimum: 1,
            maximum: field.max ?? 5,
            description: sharedDescription,
          }
          break
        case 'file':
          properties[key] = { type: 'string', title: field.label, description: sharedDescription }
          break
        case 'text':
        default:
          properties[key] = { type: 'string', title: field.label, description: sharedDescription }
          break
      }

      if (field.placeholder) {
        uiSchema[key] = {
          ...(typeof uiSchema[key] === 'object' && uiSchema[key] !== null ? (uiSchema[key] as Record<string, unknown>) : {}),
          'ui:placeholder': field.placeholder,
        }
      }
    }
  }

  const stepSummary = definition.steps
    .map((step) => `${step.title}${step.description ? ` — ${step.description}` : ''}`)
    .join('\n')

  return {
    schema: {
      type: 'object',
      title: definition.title,
      description: definition.description ? `${definition.description}\n\n${stepSummary}` : stepSummary,
      properties,
      ...(required.length > 0 ? { required } : {}),
    },
    uiSchema,
  }
}

export default function GetInTouch({
  isOpen,
  onClose,
  title,
  description,
}: GetInTouchProps) {
  const { data: formDefinition, loading, error } = useAsyncData(loadGetInTouchFormDefinition, [])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const configuredSubmitUrl = import.meta.env.VITE_FORMS_SUBMIT_URL
  const submitEndpoint =
    typeof configuredSubmitUrl === 'string' && configuredSubmitUrl.trim().length > 0
      ? configuredSubmitUrl
      : `${apiBase().replace(/\/+$/, '')}/forms/submit`

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const rjsf = formDefinition ? toRjsf(formDefinition) : null
  const submitLabel = formDefinition?.submitButtonText ?? 'Submit'

  const handleSubmit = async (event: { formData?: unknown }) => {
    if (!formDefinition) {
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const response = await fetch(submitEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: formDefinition.id,
          title: formDefinition.title,
          source: 'GetInTouch',
          data: typeof event.formData === 'object' && event.formData !== null ? event.formData : {},
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) {
        throw new Error(payload.error ?? `Form submission failed (${response.status})`)
      }
      setSubmitted(true)
    } catch (submissionError) {
      setSubmitError(submissionError instanceof Error ? submissionError.message : 'Unable to submit form')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <aside
        className={styles.GetInTouch}
        role="dialog"
        aria-modal="true"
        aria-labelledby="GetInTouch-heading"
        aria-describedby="GetInTouch-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <h2 id="GetInTouch-heading" className={styles.title}>
              {title}
            </h2>
            <p id="GetInTouch-description" className={styles.description}>
              {description}
            </p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close GetInTouch">
            Close
          </button>
        </div>
        <div className={styles.body}>
          {loading ? <p className={styles.status}>Loading form…</p> : null}
          {error ? (
            <p className={styles.error} role="alert">
              Couldn’t load this form. Please try again later.
            </p>
          ) : null}
          {submitError ? (
            <p className={styles.error} role="alert">
              {submitError}
            </p>
          ) : null}
          {!loading && !error && submitted ? (
            <p className={styles.success}>Thank you. We received your submission.</p>
          ) : null}
          {!loading && !error && !submitted && formDefinition && rjsf ? (
            <div className={styles.formRoot}>
              <Form
                schema={rjsf.schema}
                uiSchema={rjsf.uiSchema}
                validator={validator}
                noHtml5Validate
                disabled={submitting}
                onSubmit={handleSubmit}
              >
                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting ? 'Submitting…' : submitLabel}
                </button>
              </Form>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
