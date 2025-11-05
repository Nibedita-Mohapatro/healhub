// src/hooks/useForm.js
import { useCallback, useState } from "react";

/**
 * useForm
 * Simple form helper with validation and file support.
 *
 * API:
 *   const { values, errors, handleChange, handleSubmit, reset, setValues, setErrors } = useForm({ initialValues, validate, onSubmit })
 *
 * - validate(values) should return an object of errors { field: "msg" } or {}
 * - onSubmit(values) may be async; handleSubmit returns { success, errors?, error? }
 */
export default function useForm({ initialValues = {}, validate, onSubmit } = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const runValidate = useCallback((vals) => {
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
  }, [validate]);

  const handleChange = useCallback((eOrName, maybeValue) => {
    // handleChange('field', value)
    if (typeof eOrName === "string") {
      setValues(prev => {
        const next = { ...prev, [eOrName]: maybeValue };
        runValidate(next);
        return next;
      });
      return;
    }

    // handleChange(event)
    const e = eOrName;
    const { name, type, value, checked, files } = e.target;
    let nextValue = value;
    if (type === "checkbox") nextValue = checked;
    if (type === "file") nextValue = files && files.length > 0 ? files[0] : null;

    setValues(prev => {
      const next = { ...prev, [name]: nextValue };
      runValidate(next);
      return next;
    });
  }, [runValidate]);

  const handleSubmit = useCallback(async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const validation = runValidate(values);
    if (validation && Object.keys(validation).length > 0) {
      return { success: false, errors: validation };
    }
    if (typeof onSubmit === "function") {
      try {
        await onSubmit(values);
        return { success: true };
      } catch (err) {
        console.error("useForm onSubmit error", err);
        return { success: false, error: err };
      }
    }
    return { success: true };
  }, [onSubmit, runValidate, values]);

  const reset = useCallback((next = initialValues) => {
    setValues(next);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    setValues,
    errors,
    setErrors,
    handleChange,
    handleSubmit,
    reset
  };
}
