import { SVG, type SVGProps } from './SVG'

interface Props extends SVGProps {}

function IconClose12(props: Props) {
  return (
    <SVG {...props} type="outline" size={12}>
      <path d="M 2 2 L 10 10 M 2 10 L 10 2" stroke="currentColor" fill="none" />
    </SVG>
  )
}

export default IconClose12
