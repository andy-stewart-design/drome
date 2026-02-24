import { SVG, type SVGProps } from './SVG'

interface Props extends SVGProps {}

function IconCheck16(props: Props) {
  return (
    <SVG {...props} type="outline" size={16}>
      <path d="M2.5 8.5L6.5 12.5L13 3" />
    </SVG>
  )
}

export default IconCheck16
