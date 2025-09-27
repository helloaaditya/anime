const documentationController = async () => {
  const { default: apiDocumentation } = await import('../utils/documentation.js');
  return apiDocumentation;
};

export default documentationController;
