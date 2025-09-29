"use client"

import { useActionState, useState, ChangeEvent, useEffect } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Checkbox, Label } from "@medusajs/ui"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

interface FormData {
  email: string
  first_name: string
  password: string
}

interface ValidationErrors {
  email?: string
  first_name?: string
  password?: string
  terms?: string
}

const initialFormData: FormData = {
  email: "",
  first_name: "",
  password: "",
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (name: string, value: string | boolean) => {
    const errors: ValidationErrors = {}
    
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!value) {
        errors.email = 'इमेल आवश्यक छ'
      } else if (!emailRegex.test(value as string)) {
        errors.email = 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्'
      }
    }
    
    if (name === 'first_name') {
      if (!value || (value as string).trim().length < 2) {
        errors.first_name = 'पहिलो नाम कम्तिमा ४ अक्षरको हुनुपर्छ'
      }
    }
    
    if (name === 'password') {
      if (!value) {
        errors.password = 'पासवर्ड आवश्यक छ'
      } else if ((value as string).length < 8) {
        errors.password = 'पासवर्ड कम्तिमा ८ अक्षरको हुनुपर्छ'
      }
    }
    
    if (name === 'terms' && !value) {
      errors.terms = 'तपाइँले नियम र सर्तहरू स्वीकार गर्नुपर्छ'
    }
    
    return errors
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    
    const fieldErrors = validateField(name, value)
    setValidationErrors(prev => ({
      ...prev,
      ...fieldErrors
    }))
  }

  const handleTermsChange = (checked: boolean) => {
    setTermsAccepted(checked)
    
    if (checked && validationErrors.terms) {
      setValidationErrors(prev => ({
        ...prev,
        terms: undefined
      }))
    } else if (!checked && touched.terms) {
      const fieldErrors = validateField('terms', checked)
      setValidationErrors(prev => ({
        ...prev,
        ...fieldErrors
      }))
    }
  }

  // Validate all fields on form change
  useEffect(() => {
    const allErrors: ValidationErrors = {}
    
    Object.keys(formData).forEach(key => {
      const fieldErrors = validateField(key, formData[key as keyof FormData])
      Object.assign(allErrors, fieldErrors)
    })
    
    const termsErrors = validateField('terms', termsAccepted)
    Object.assign(allErrors, termsErrors)
    
    // Only show errors for touched fields or if form has been submitted (message exists)
    const filteredErrors: ValidationErrors = {}
    Object.keys(allErrors).forEach(key => {
      if (touched[key] || message) {
        filteredErrors[key as keyof ValidationErrors] = allErrors[key as keyof ValidationErrors]
      }
    })
    
    setValidationErrors(filteredErrors)
  }, [formData, termsAccepted, touched, message])

  const isValid =
    termsAccepted &&
    !!formData.email &&
    !!formData.first_name &&
    !!formData.password &&
    Object.keys(validationErrors).length === 0

  return (
    <div
      className="max-w-sm w-full h-full flex flex-col justify-center gap-6 my-auto"
      data-testid="register-page"
    >
      <div className="mb-2">
        <h1 
          className="text-4xl small:text-5xl font-bold text-pharmint-white text-left leading-tight mb-2"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.9) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          फार्मिन्टमा सामेल हुनुहोस्
        </h1>
        <p className="text-lg text-accent font-medium">
          आफ्नो खाता बनाउनुहोस् - एक मिनेटभन्दा कम समय लाग्छ
        </p>
      </div>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-4">
          <Input
            label="इमेल"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-describedby={validationErrors.email ? "email-error" : undefined}
          />
          {validationErrors.email && (
            <p id="email-error" className="text-red-500 text-sm -mt-3 mb-1" role="alert">
              {validationErrors.email}
            </p>
          )}
          <Input
            label="पहिलो नाम"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
            value={formData.first_name}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-describedby={validationErrors.first_name ? "first-name-error" : undefined}
          />
          {validationErrors.first_name && (
            <p id="first-name-error" className="text-red-500 text-sm -mt-3 mb-1" role="alert">
              {validationErrors.first_name}
            </p>
          )}
          <Input
            label="पासवर्ड"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-describedby={validationErrors.password ? "password-error" : undefined}
          />
          {validationErrors.password && (
            <p id="password-error" className="text-red-500 text-sm -mt-3 mb-1" role="alert">
              {validationErrors.password}
            </p>
          )}
          {formData.password && !validationErrors.password && (
            <p className="text-green-500 text-sm -mt-3 mb-1">
              ✓ पासवर्डले आवश्यकताहरू पूरा गर्छ
            </p>
          )}
          {/* Hidden fields for default values */}
          <input type="hidden" name="last_name" value="" />
          <input type="hidden" name="phone" value="" />
          <div className="flex flex-col gap-2 w-full border-b border-pharmint-border my-6" />
        </div>
        <div className="bg-background-secondary/50 border border-pharmint-border rounded-lg p-4 mb-4">
          <p className="text-sm text-pharmint-muted">
            📝 <strong className="text-pharmint-white">नोट:</strong> तपाइँले आफ्नो पूर्ण प्रोफाइल (लास्ट नेम, फोन, आदि) पछि आफ्नो खाता सेटिङमा पूरा गर्न सक्नुहुन्छ।
          </p>
        </div>
        <div className="flex items-start gap-3 mb-4">
          <Checkbox
            name="terms"
            id="terms-checkbox"
            data-testid="terms-checkbox"
            checked={termsAccepted}
            onCheckedChange={(checked) => {
              handleTermsChange(!!checked)
              setTouched(prev => ({ ...prev, terms: true }))
            }}
            aria-describedby={validationErrors.terms ? "terms-error" : undefined}
          />
          {/* Hidden input to ensure checkbox state is submitted with form */}
          <input 
            type="hidden" 
            name="terms" 
            value={termsAccepted ? "true" : "false"} 
          />
          <Label
            id="terms-label"
            className="flex items-center text-pharmint-white !text-xs hover:cursor-pointer !transform-none leading-relaxed"
            htmlFor="terms-checkbox"
            data-testid="terms-label"
          >
            म स्वीकार गर्छु{" "}
            <LocalizedClientLink
              href="/content/terms-of-use"
              className="text-accent hover:text-accent-hover underline mx-1"
            >
              नियम र सर्तहरू
            </LocalizedClientLink>{" "}
            र{" "}
            <LocalizedClientLink
              href="/content/privacy-policy"
              className="text-accent hover:text-accent-hover underline ml-1"
            >
              गोपनीयता नीति
            </LocalizedClientLink>
            .
          </Label>
        </div>
        {validationErrors.terms && (
          <p id="terms-error" className="text-red-500 text-sm mb-4 ml-8" role="alert">
            {validationErrors.terms}
          </p>
        )}
        <ErrorMessage error={message} data-testid="register-error" />
        <div className="flex flex-col gap-3 mt-8">
          <SubmitButton
            className="w-full h-12 bg-accent hover:bg-accent-hover text-pharmint-white font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
            data-testid="register-button"
            disabled={!isValid}
          >
            खाता बनाउनुहोस्
          </SubmitButton>
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="w-full h-12 border border-pharmint-border bg-background-secondary text-pharmint-white hover:bg-pharmint-border/20 font-semibold transition-all duration-200 rounded-base"
            data-testid="sign-in-button"
          >
            पहिले नै खाता छ? साइन इन गर्नुहोस्
          </button>
        </div>
      </form>
    </div>
  )
}

export default Register
