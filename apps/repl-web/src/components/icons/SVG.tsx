import type { ComponentProps } from 'solid-js'

type SVGProps = ComponentProps<'svg'>

interface Props extends SVGProps {
  size: number
}

function SVG({ children, size, ...rest }: Props) {
  return (
    <svg {...rest} viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {children}
    </svg>
  )
}

export default SVG
export { SVG, type SVGProps }
