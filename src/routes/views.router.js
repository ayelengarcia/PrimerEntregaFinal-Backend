//solo contendra renderizaciones
import { Router } from "express";
import ProductManager from "../Dao/fileManager/ProductManager.js";
import ProductModel from "../Dao/mongoManager/models/productModel.js";
import passport from "passport";

const producto = new ProductManager("ddbb/productos.json");
const router = Router();

//Ruta principal
router.get("/", (req, res) => {
  res.render("index", {});
});

//Iniciar sesión
router.get("/login", (req, res) => {
  if (req.session?.user) return res.redirect("/profile");

  res.render("login", {});
});

//Registro
router.get("/register", (req, res) => {
  if (req.session?.user) return res.redirect("/profile");

  res.render("register", {});
});

//Iniciar sesion con github
router.get(
  "/login-github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

//midleware para autenticacion
const autenticacion = (req, res, next) => {
  if (req.session?.user) return next();

  return res.status(401).redirect("/login");
};

//Perfil
router.get("/profile", autenticacion, (req, res) => {
  const user = req.session.user;

  res.render("profile", user);
});

//midleware para Admins
const checkAdmin = (req, res, next) => {
  if (req.session?.user && req.session.user.roles === "Admin") return next();

  return res.status(401).redirect("/login");
};

//Perfil admin
router.get("/admin", checkAdmin, (req, res) => {
  const user = req.session.user;

  res.render("admin", user);
});

// Productos Real-times
router.get("/products", async (req, res) => {
  const products = await producto.getProducts();

  res.render("products", { products });
});

// PAGINATE
router.get("/products/paginate", async (req, res) => {
  const page = parseInt(req.query?.page || 1);
  const limit = parseInt(req.query?.limit || 3);

  const queryParams = req.query?.query || "";
  const query = {};

  if (queryParams) {
    const [field, value] = queryParams.split(",");
    if (!isNaN(parseInt(value))) {
      query[field] = value;
    }
  }

  const sortField = req.query?.sortField || "createdAt";
  const sortOrder = req.query?.sortOrder === "desc" ? -1 : 1;

  try {
    const products = await ProductModel.paginate(query, {
      limit,
      page,
      lean: true,
      sort: { [sortField]: sortOrder },
    });

    products.prevLink = products.hasPrevPage
      ? `/products/paginate/?page=${products.prevPage}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}`
      : "";
    products.nextLink = products.hasNextPage
      ? `/products/paginate/?page=${products.nextPage}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}`
      : "";

    return res.render("paginate", products);
  } catch (error) {
    return res.status(500).send("Error al enviar products.");
  }
});
//127.0.0.1:8080/products/paginate/?page=&limit=7&sortField=price&sortOrder=desc

//Chat socket io
router.get("/messages", (req, res) => {
  res.render("messages", {});
});

//Setear cookie
// router.get("/cookieSet", (req, res) => {
//   res
//     .cookie("cookieApp", "Probando cookie", { maxAge: 3000 }) //maxAge (tiempo de vida de la cookie)
//     .cookie("cookieForever", "Cookie por siempreee")
//     .cookie("cookieSigned", "El valor de la cookie", { signed: true }) //cookie cifrada para q no de edite la info
//     .send("Cookie seteada");
// });

//Obtener cookie
// router.get("/cookieGet", (req, res) => {
//   const cookie = req.cookies;
//   const cookieSigned = req.signedCookies;

//   console.log(cookie, cookieSigned); //cookieSigned descifrar cookie
//   res.send("Se han leido las cookies");
// });

//Eliminar cookie
// router.get("/cookieDelete", (req, res) => {
//   res.clearCookie("cookieForever").send("Cookie borrada");
// });

export default router;
