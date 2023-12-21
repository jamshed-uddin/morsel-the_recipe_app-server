const errorResponse = (res, error) => {
  return res
    .status(401)
    .json({ error: "Something went wrong", message: error.message });
};

module.exports = errorResponse;
