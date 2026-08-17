export const ok = (res, data = {}, message = "Success", statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

export const created = (res, data = {}, message = "Created") => ok(res, data, message, 201);

export default { ok, created };
