// src/hooks/useForm.js
import { useState, useCallback, useRef } from "react";

/**
 * FIXED & STABLE useForm
 * Prevents stale values inside handleSubmit.
 */

export default function useForm({ initialValues = {}, validate, onSubmit } = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  // 🆕 Use a ref to ALWAYS have the latest values (fixes stale closure bug)
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const runValidate = useCallback(
    (vals) => {
      if (typeof validate === "function") {
        try {
          const res = validate(vals) || {};
          setErrors(res);
          return res;
        } catch (e) {
          console.error("useForm: validate threw", e);
          setErrors({});
          return {};
        }
      } else {
        setErrors({});
        return {};
      }
    },
    [validate]
  );

  const handleChange = useCallback(
    (eOrName, maybeValue) => {
      if (typeof eOrName === "string") {
        setValues((prev) => {
          const next = { ...prev, [eOrName]: maybeValue };
          runValidate(next);
          return next;
        });
        return;
      }

      const e = eOrName;
      const { name, type, value, checked, files } = e.target;

      let nextValue = value;
      if (type === "checkbox") nextValue = checked;
      if (type === "file") nextValue = files?.[0] || null;

      setValues((prev) => {
        const next = { ...prev, [name]: nextValue };
        runValidate(next);
        return next;
      });
    },
    [runValidate]
  );

  // FIXED handleSubmit – ALWAYS uses latest values via ref
  const handleSubmit = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();

      const freshValues = valuesRef.current; // 🆕 always latest values

      const validation = runValidate(freshValues);
      if (Object.keys(validation).length > 0) {
        return { success: false, errors: validation };
      }

      if (typeof onSubmit === "function") {
        try {
          await onSubmit(freshValues);
          return { success: true };
        } catch (err) {
          console.error("useForm onSubmit error", err);
          return { success: false, error: err };
        }
      }

      return { success: true };
    },
    [onSubmit, runValidate]
  );

  const reset = useCallback(
    (next = initialValues) => {
      setValues(next);
      setErrors({});
    },
    [initialValues]
  );

  return {
    values,
    setValues,
    errors,
    setErrors,
    handleChange,
    handleSubmit,
    reset,
  };
}
