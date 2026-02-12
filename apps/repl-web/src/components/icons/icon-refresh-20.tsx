import { SVG, type SVGProps } from './SVG'

interface Props extends SVGProps {}

function IconRefresh20(props: Props) {
  return (
    <SVG {...props} size={20}>
      <path
        d="M18 1V7H17.5M12 7H17.5M16.9297 14C15.5465 16.3912 12.9611 18 10 18C7.03887 18 4.5 16.5 3 14C2.84641 13.7345 2.77791 13.4593 2.65509 13.1757C2.23361 12.2022 2 11.1284 2 10C2 5.58172 5.58172 2 10 2C13.5 2 16 4 17.5 7"
        stroke="currentColor"
        stroke-width={1.5}
      />
    </SVG>
  )
}

export default IconRefresh20
