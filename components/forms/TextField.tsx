import { forwardRef } from "react";
import { ariaDescribedBy } from "./described-by";
import {
  formFieldInvalidBorderClassName,
  formFieldTextClassName,
} from "./form-control-classes";
import { FormField } from "./FormField";

export type TextFieldProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "id"
> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ id, label, error, hint, className = "", ...rest }, ref) => {
    return (
      <FormField id={id} label={label} hint={hint} error={error}>
        {({ hintId, errorId }) => (
          <input
            id={id}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy(hintId, errorId)}
            className={`${formFieldTextClassName} ${error ? formFieldInvalidBorderClassName : ""} ${className}`}
            {...rest}
          />
        )}
      </FormField>
    );
  },
);

TextField.displayName = "TextField";
