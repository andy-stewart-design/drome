import { SVG, type SVGProps } from "./svg";

interface Props extends SVGProps {}

function IconRefresh20(props: Props) {
  return (
    <SVG {...props} type="outline" size={20}>
      {/*<path d="M18 1V7H17.5M12 7H17.5M16.9297 14C15.5465 16.3912 12.9611 18 10 18C7.03887 18 4.5 16.5 3 14C2.84641 13.7345 2.77791 13.4593 2.65509 13.1757C2.23361 12.2022 2 11.1284 2 10C2 5.58172 5.58172 2 10 2C13.5 2 16 4 17.5 7" />*/}
      <path d="M14.9497 14.9497C13.683 16.2165 11.933 17 10 17C6.13401 17 3 13.866 3 10C3 6.134 6.13401 3 10 3C13.5 3 15.5 5 16.5 8M17 1V8H16.5M10 8H16.5" />
    </SVG>
  );
}

export default IconRefresh20;
