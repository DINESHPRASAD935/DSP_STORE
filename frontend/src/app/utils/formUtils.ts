/**
 * Generic form input change handler
 */
export function createInputHandler<T extends Record<string, any>>(
  setFormData: React.Dispatch<React.SetStateAction<T>>
) {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
}

/**
 * Reset form to initial state
 */
export function resetForm<T extends Record<string, any>>(
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  initialValues: T
) {
  setFormData(initialValues);
}
