import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("displays children text", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
  })

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole("button"))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("renders with variant prop", () => {
    render(<Button variant="outline">Outline Button</Button>)
    const button = screen.getByRole("button", { name: /outline button/i })
    expect(button).toBeInTheDocument()
  })

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>Disabled Button</Button>)
    expect(screen.getByRole("button")).toBeDisabled()
  })
})
