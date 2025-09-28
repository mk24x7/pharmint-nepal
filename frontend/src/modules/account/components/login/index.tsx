import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="max-w-sm w-full h-full flex flex-col justify-center gap-6 my-auto"
      data-testid="login-page"
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
          Welcome back
        </h1>
        <p className="text-lg text-accent font-medium">
          Sign in to your Pharmint account
        </p>
      </div>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
          <div className="flex flex-col gap-2 w-full border-b border-pharmint-border my-6" />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <div className="flex flex-col gap-3 mt-8">
          <SubmitButton 
            data-testid="sign-in-button" 
            className="w-full h-12 bg-accent hover:bg-accent-hover text-pharmint-white font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            Sign In
          </SubmitButton>
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
            className="w-full h-12 border border-pharmint-border bg-background-secondary text-pharmint-white hover:bg-pharmint-border/20 font-semibold transition-all duration-200 rounded-base"
            data-testid="register-button"
          >
            Create New Account
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login
