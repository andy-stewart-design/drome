import type { ComponentProps } from 'solid-js'

type SVGProps = ComponentProps<'svg'>

interface Props extends SVGProps {
  size: number
  type?: 'outline' | 'solid'
}

function SVG({ children, size, type = 'outline', ...rest }: Props) {
  const childProps: SVGProps =
    type === 'outline'
      ? {
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': 1.5,
        }
      : {
          fill: 'currentColor',
          stroke: 'none',
        }

  return (
    <svg
      {...rest}
      {...childProps}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
    >
      {children}
    </svg>
  )
}

export default SVG
export { SVG, type SVGProps }
