import { SVG, type SVGProps } from './SVG.tsx'

interface Props extends SVGProps {}

function IconPlay20(props: Props) {
  return (
    <SVG {...props} size={20}>
      <path
        d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z"
        fill="currentColor"
      />
    </SVG>
  )
}

export default IconPlay20
