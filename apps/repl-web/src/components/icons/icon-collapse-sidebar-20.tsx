import { SVG, type SVGProps } from './SVG'

interface Props extends SVGProps {}

function IconCollapseSidebar20(props: Props) {
  return (
    <SVG {...props} type="outline" size={20}>
      <path d="M11 4L17 10M17 10L11 16M17 10H6" />
      <path d="M2 3L2 17" />
    </SVG>
  )
}

export default IconCollapseSidebar20
