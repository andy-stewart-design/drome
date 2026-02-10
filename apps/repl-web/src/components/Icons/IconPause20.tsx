import { SVG, type SVGProps } from './SVG'

interface Props extends SVGProps {}

function IconPaused20(props: Props) {
  return (
    <SVG {...props} size={20}>
      <rect x="4" y="3" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="12" y="3" width="4" height="14" rx="1" fill="currentColor" />
    </SVG>
  )
}

export default IconPaused20
