export const MODEL_TEXT = {
  ADD_MODEL_DIALOG: {
    title: "Add New Model",
    description:
      "Register a new model to the application. Evaluate and compare against other models.",
    primaryActionLabel: "Add Model",
    secondaryActionLabel: "Cancel",
  },

  EDIT_MODEL_DIALOG: {
    title: "Edit Model",
    description: "Update the model details used throughout evaluations.",
    primaryActionLabel: "Save Changes",
    secondaryActionLabel: "Cancel",
  },

  FORM: {
    name: {
      label: "Model Name",
      placeholder: "e.g. GPT-4 Turbo",
    },
    endpoint: {
      label: "Model Endpoint",
      placeholder: "e.g. https://model-endpoint.com/v1",
    },
    apiKey: {
      label: "API Key",
      placeholder: "Enter your API key",
    },
    provider: {
      label: "Provider",
      placeholder: "Select a provider",
    },
    description: {
      label: "Description",
      description: "Provide a brief description of the model.",
      placeholder: "Briefly describe the model",
    },
  },

  DELETE_CONFIRMATION_DIALOG: {
    title: "Delete Model?",
    description:
      "This will permanently delete this model and all associated evaluations. Are you sure you want to continue?",
    primaryActionLabel: "Delete",
    secondaryActionLabel: "Cancel",
  },

  EMPTY_STATE: {
    title: "No Models Yet",
    description:
      "You haven't created any models yet. Get started by creating your first model.",
  },

  TOAST: {
    addSuccess: "Model added successfully!",
    addError: "Failed to add model. Please try again later.",
    editSuccess: "Model updated successfully!",
    editError: "Failed to update model. Please try again later.",
    deleteSuccess: "Model deleted successfully!",
    deleteError: "Failed to delete model. Please try again later. Error:",
  },
}
