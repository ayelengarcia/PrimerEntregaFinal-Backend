import { Router } from "express";
import passport from "passport";

const router = Router();

//Login local
router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/login",
  }),
  async (req, res) => {
    if (!req.user) return res.status(400).send("Credenciales inválidas");

    req.session.user = req.user;
    console.log(`${req.user.first_name} acaba de iniciar sesión`);

    if (req.user.roles === "Admin") {
      return res.redirect("/admin"); // Vista admin
    } else {
      return res.redirect("/profile"); // Vista User
    }
  }
);

//Register local
router.post(
  "/register",
  passport.authenticate("register", { failureRedirect: "/register" }),
  async (req, res) => {
    return res.redirect("/login");
  }
);

//login Github
router.get(
  "/githubcallback",
  passport.authenticate(
    "github",
    { failureRedirect: "/login" },
    async (req, res) => {
      req.session.user = req.user;
      res.redirect("/profile");
    }
  )
);

// Cerrar sesión
router.get("/logout", (req, res) => {
  if (req.session.user) {
    console.log(`${req.session.user.first_name} acaba de cerrar sesión`);
    req.session.destroy((err) => {
      if (err) {
        console.error("Error al cerrar sesión:", err);
      }
      res.redirect("/login");
    });
  }
});

export default router;
