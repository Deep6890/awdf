const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (schema) => {
  return (req, res, next) => {
    const data = req.body || {};
    const details = [];

    for (const [field, rules] of Object.entries(schema)) {
      const val = data[field];

      // Convert shorthand strings e.g. { email: 'email' }
      const ruleObj =
        typeof rules === 'string'
          ? { type: rules, required: true }
          : { ...rules };

      // Required check
      if (ruleObj.required) {
        if (val === undefined || val === null || val === '') {
          details.push(`${field} is required`);
          continue;
        }
        if (typeof val === 'string' && val.trim() === '') {
          details.push(`${field} cannot be empty`);
          continue;
        }
      }

      // If optional and not provided, skip further checks
      if (val === undefined || val === null || val === '') {
        continue;
      }

      // Email check
      if (ruleObj.type === 'email' || ruleObj.email) {
        if (!EMAIL_REGEX.test(String(val))) {
          details.push('Invalid email format');
        }
      }

      // Min length check
      if (ruleObj.min !== undefined) {
        if (typeof val === 'string' && val.length < ruleObj.min) {
          details.push(`${field} must be at least ${ruleObj.min} characters`);
        }
      }

      // Max length check
      if (ruleObj.max !== undefined) {
        if (typeof val === 'string' && val.length > ruleObj.max) {
          details.push(`${field} must not exceed ${ruleObj.max} characters`);
        }
      }

      // Enum check
      if (ruleObj.enum && Array.isArray(ruleObj.enum)) {
        if (!ruleObj.enum.includes(val)) {
          details.push(
            `${field} must be one of: ${ruleObj.enum.join(', ')}`
          );
        }
      }
    }

    if (details.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        details
      });
    }

    next();
  };
};

module.exports = validate;
