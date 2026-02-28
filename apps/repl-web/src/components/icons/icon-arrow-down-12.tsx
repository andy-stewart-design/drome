import { SVG, type SVGProps } from './SVG'

interface Props extends SVGProps {}

function IconArrowDown12(props: Props) {
  return (
    <SVG {...props} type="outline" size={12}>
      <path d="M 6 1 L 6 10 M 2 6 L 6 10 L 10 6" />
    </SVG>
  )
}

export default IconArrowDown12
