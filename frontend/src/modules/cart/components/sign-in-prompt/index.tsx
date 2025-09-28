import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-background-secondary/30 border border-pharmint-border rounded-lg p-4 flex items-center justify-between">
      <div>
        <Heading level="h2" className="txt-xlarge text-pharmint-white">
          Already have an account?
        </Heading>
        <Text className="txt-medium text-pharmint-muted mt-2">
          Sign in for a better experience and faster checkout.
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="secondary" className="h-10 bg-accent hover:bg-accent-hover text-white border-accent" data-testid="sign-in-button">
            Sign in
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
