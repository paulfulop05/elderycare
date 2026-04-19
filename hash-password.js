const bcrypt = require("bcrypt");

const pass = "eldery";
bcrypt.hash(pass, 10).then((hash) => {
  console.log("Hashed password:", hash);
  process.exit(0);
});
