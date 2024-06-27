const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("item");

// Display list of all Items.
exports.item_list = asyncHandler(async (req, res, next) => {
    const allItems = await Item.find().exec();
  res.render("item_list", {
    title: "Items List",
    items: allItems,
  });
});

exports.item_detail = asyncHandler(async (req,res,next) => {
  const item = await Item.findById(req.params.id).populate('category').exec()

  if (item === null) {
    // No results.
    debug(`id not found on details fetch: ${req.params.id}`);
    const err = new Error("item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_detail", {
    item: item
  });
})

exports.item_create_get = asyncHandler(async (req, res, next) => {
  // Get all authors and genres, which we can use for adding to our item.
  const allCategories = await Category.find().sort({ name: 1 }).exec()

  res.render("item_form", {
    title: "Create Item",
    categories: allCategories,
    item: undefined,
    errors: undefined
  });
});

// Handle item create on POST.
exports.item_create_post = [

  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category", "Category must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be Numeric")
    .isFloat()
    .escape(),
  body("numberInStock", "Stock must not be Numeric")
    .isInt()
    .escape(),
  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      numberInStock: req.body.numberInStock,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all Categories for form.
      const allCategories = await Category.find().sort({ name: 1 }).exec()

      // Mark our selected genres as checked.

      res.render("item_form", {
        title: "Create Item",
        categories: allCategories,
        item: item,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save item.
      await item.save();
      res.redirect(item.url);
    }
  }),
];

// Display Item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
    // Get details of item and all their items (in parallel)
    const item = await Item.findById(req.params.id).exec()
  
    if (item === null) {
      // No results.
      res.redirect("/catalog/items");
    }
  
    res.render("item_delete", {
      title: "Delete item",
      item: item
    });
  });
  
  // Handle Item delete on POST.
  exports.item_delete_post = asyncHandler(async (req, res, next) => {
    // Get details of item and all their items (in parallel)
    const item = await Item.findById(req.params.id).exec()
  
    if (item === null) {
      // item has items. Render in same way as for GET route.
      res.render("item_delete", {
        title: "Delete item",
        item: item
      });
      return;
    } else {
      // item has no items. Delete object and redirect to the list of items.
      await Item.findByIdAndDelete(req.body.itemid);
      res.redirect("/items");
    }
  });
  

// Display Item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
    // Get item for form.
    const [item, allCategories] = await Promise.all([
      Item.findById(req.params.id).populate('category').exec(),
      Category.find().sort({ name: 1 }).exec()
    ])
  
    if (item === null) {
      // No results.
      debug(`id not found on update: ${req.params.id}`);
      const err = new Error("Item not found");
      err.status = 404;
      return next(err);
    }
  
    // Mark our selected genres as checked.
  
    res.render("item_form", {
      title: "Create Item",
      categories: allCategories,
      item: item,
      errors: undefined
    });
});

// Handle Item update on POST.
exports.item_update_post = [

    // Validate and sanitize fields.
    body("name", "Name must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("category", "Category must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("description", "Description must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("price", "Price must not be Numeric")
      .isFloat()
      .escape(),
    body("numberInStock", "Stock must not be Numeric")
      .isInt()
      .escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

      // Create a Item object with escaped and trimmed data.
      const item = new Item({
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
        price: req.body.price,
        numberInStock: req.body.numberInStock,
        _id: req.params.id
      });

      if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.render("item_form", {
        title: "Update Item",
        categories: allCategories,
        item: item,
        errors: errors.array(),
      });
      return;
      } else {
      // Data from form is valid. Update the record.
      const updateditem = await Item.findByIdAndUpdate(req.params.id, item, {});
      // Redirect to book detail page.
      res.redirect(updateditem.url);
      }
    }),
];