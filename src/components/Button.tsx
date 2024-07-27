export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  bgColor?: "gray" | "green" | "deepGreen";
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  bgColor = "green",
  size = "md",
  ...rest
}) => {
  let btnColor = {
    gray: `bg-gray-900`,
    green: `bg-main`,
    deepGreen: `bg-sub`,
  };
  let btnSize = {
    sm: "py-1 px-2 text-sm",
    md: "py-1 px-4 text-base",
    lg: "py-2 px-6 text-lg",
  };

  return (
    <button
      type={type}
      className={`${btnColor[bgColor]} ${btnSize[size]} text-white font-semibold ml-2 text-base hover:bg-main rounded`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
