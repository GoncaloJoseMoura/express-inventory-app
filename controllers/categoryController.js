const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("author");

// Display list of all Authors.
exports.index = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances, authors and category counts (in parallel)
  const [
    numItems,
    numCategories,
  ] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Electronics Store Home",
    categories_count: numCategories,
    items_count: numItems,
  });
});

exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().exec();
  res.render("category_list", {
    title: "Categories List",
    categories_list: allCategories,
  });
});

exports.category_detail = asyncHandler(async (req,res,next) => {
  const [category, categoryItems] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (category === null) {
    // No results.
    debug(`id not found on details fetch: ${req.params.id}`);
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_detail", {
    title: category.name,
    items: categoryItems,
  });
})

// // Display Category create form on GET.
exports.category_create_get = (req, res, next) => {
  res.render("category_form", { title: "Create Category", category: undefined, errors: undefined });
};

// // Handle Category create on POST.
exports.category_create_post = [
  // Validate and sanitize the name field.
  body("name")
    .trim()
    .isLength({ min: 3 })
    .escape()
    .withMessage('Category name must contain at least 3 characters')
    .isAlphanumeric()
    .withMessage('Category has non-alphanumeric characters.'),
  body("description")
    .trim()
    .isLength({ min: 15 })
    .escape()
    .withMessage('Category name must contain at least 15 characters'),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data.
    const category = new Category({ name: req.body.name, description: req.body.description});

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Category with same name already exists.
      const categoryExists = await Category.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec();
      if (categoryExists) {
        // category exists, redirect to its detail page.
        res.redirect(categoryExists.url);
      } else {
        await category.save();
        // New category saved. Redirect to category detail page.
        res.redirect(category.url);
      }
    }
  }),
];

// Display category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of category and all their books (in parallel)
  const [category, allItemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (category === null) {
    // No results.
    res.redirect('/catalog/categories');
  }

  res.render('category_delete', {
    title: 'Delete category',
    category,
    category_items: allItemsInCategory,
  });
});

// Handle category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of category and all their books (in parallel)
  const [category, allItemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (allItemsInCategory.length > 0) {
    // category has books. Render in same way as for GET route.
    res.render('category_delete', {
      title: 'Delete category',
      category,
      category_items: allItemsInCategory,
    });
  } else {
    // category has no books. Delete object and redirect to the list of categorys.
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect('/categories');
  }
});

// Display category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
// Get category for form.
const category = await Category.findById(req.params.id).exec()

if (category === null) {
  // No results.
  debug(`id not found on update: ${req.params.id}`);
  const err = new Error("Category not found");
  err.status = 404;
  return next(err);
}

// Mark our selected categorys as checked.

res.render("category_form", {
  title: "Update category",
  category: category,
  errors: undefined
});
});

// Handle category update on POST.
exports.category_update_post = [

  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 3 })
    .escape()
    .withMessage('Category name must contain at least 3 characters')
    .isAlphanumeric()
    .withMessage('Category has non-alphanumeric characters.'),
  body("description")
    .trim()
    .isLength({ min: 15 })
    .escape()
    .withMessage('Category name must contain at least 15 characters'),


// Process request after validation and sanitization.
asyncHandler(async (req, res, next) => {
  // Extract the validation errors from a request.
  const errors = validationResult(req);

  // Create a Book object with escaped/trimmed data and old id.

  const category = new Category({
     name: req.body.name,
     description: req.body.description,
     _id: req.params.id
  });

  if (!errors.isEmpty()) {
    // There are errors. Render form again with sanitized values/error messages.

    res.render("category_form", {
      title: "Update category",
      category: category,
      errors: errors.array(),
    });
    return;
  } else {
    // Data from form is valid. Update the record.
    const updatedcategory = await Category.findByIdAndUpdate(req.params.id, category, {});
    // Redirect to book detail page.
    res.redirect(updatedcategory.url);
  }
}),
]
