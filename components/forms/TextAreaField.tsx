import { forwardRef } from "react";
import { ariaDescribedBy } from "./described-by";
import {
  formFieldInvalidBorderClassName,
  formFieldTextAreaExtraClassName,
  formFieldTextClassName,
} from "./form-control-classes";
import { FormField } from "./FormField";

export type TextAreaFieldProps = Omit<
  React.ComponentPropsWithoutRef<"textarea">,
  "id"
> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ id, label, error, hint, className = "", rows = 5, ...rest }, ref) => {
    return (
      <FormField id={id} label={label} hint={hint} error={error}>
        {({ hintId, errorId }) => (
          <textarea
            id={id}
            ref={ref}
            rows={rows}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy(hintId, errorId)}
            className={`${formFieldTextClassName} ${formFieldTextAreaExtraClassName} ${error ? formFieldInvalidBorderClassName : ""} ${className}`}
            {...rest}
          />
        )}
      </FormField>
    );
  },
);

TextAreaField.displayName = "TextAreaField";
