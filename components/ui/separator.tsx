import {cn} from "@/lib/utils";

export type SeparatorProps = React.HTMLAttributes<HTMLHRElement>;

export function Separator({className, ...props}: SeparatorProps): React.JSX.Element {
  return <hr className={cn("border-border", className)} {...props} />;
}
