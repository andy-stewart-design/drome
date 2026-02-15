import { SVG, type SVGProps } from './SVG'

interface Props extends SVGProps {}

function IconChevronRight16(props: Props) {
  return (
    <SVG {...props} type="outline" size={16}>
      <path d="M 6 2 L 12 8 L 6 14" />
    </SVG>
  )
}

export default IconChevronRight16
