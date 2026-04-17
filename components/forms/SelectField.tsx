import { forwardRef } from "react";
import { ariaDescribedBy } from "./described-by";
import {
  formFieldInvalidBorderClassName,
  formSelectChevronBackgroundImage,
  formSelectControlClassName,
} from "./form-control-classes";
import { FormField } from "./FormField";

export type SelectFieldProps = Omit<
  React.ComponentPropsWithoutRef<"select">,
  "id"
> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  placeholderOption?: string;
};

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      id,
      label,
      error,
      hint,
      placeholderOption = "Select…",
      children,
      className = "",
      ...rest
    },
    ref,
  ) => {
    return (
      <FormField id={id} label={label} hint={hint} error={error}>
        {({ hintId, errorId }) => (
          <select
            id={id}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy(hintId, errorId)}
            className={`${formSelectControlClassName} ${error ? formFieldInvalidBorderClassName : ""} ${className}`}
            style={{
              backgroundImage: formSelectChevronBackgroundImage,
            }}
            {...rest}
          >
            <option value="">{placeholderOption}</option>
            {children}
          </select>
        )}
      </FormField>
    );
  },
);

SelectField.displayName = "SelectField";
