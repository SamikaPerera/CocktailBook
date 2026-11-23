// Runs after express-validator rules. If any rule failed, stop here and
// send a 400 Bad Request listing every problem, so the client can show them.
import { validationResult } from 'express-validator';

export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  res.status(400).json({
    message: errors.map((e) => e.message).join('. '),
    errors,
  });
}
