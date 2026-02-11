import { SVG, type SVGProps } from './SVG.tsx'

interface Props extends SVGProps {}

function IconSidebar20(props: Props) {
  return (
    <SVG {...props} size={20}>
      <rect
        x={2}
        y={3}
        width={16}
        height={14}
        rx={4}
        stroke="currentColor"
        stroke-width={1.5}
        fill="none"
      />
      <line
        x1={12}
        y1={3}
        x2={12}
        y2={17}
        stroke="currentColor"
        stroke-width={1.5}
        fill="none"
      />
    </SVG>
  )
}

export default IconSidebar20
