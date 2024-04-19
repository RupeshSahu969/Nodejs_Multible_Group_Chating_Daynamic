// auth.js

const isLogin = async (req, res, next) => {
  try {
    if (req.session.user) {
      next(); // Proceed to the next middleware or route handler
    } else {
      res.redirect("/"); // Redirect to login page if not logged in
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user) {
      res.redirect("/dashboard"); // Redirect to dashboard if already logged in
    } else {
      next(); // Proceed to the next middleware or route handler
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout
};
