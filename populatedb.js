#! /usr/bin/env node

console.log(
    'This script populates some test items, categories to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://your_user_name:your_password@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  console.log(userArgs)
  
  const Category = require("./models/category");
  const Item = require("./models/item");
  
  const categories = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategories();
    await createItems();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  // We pass the index to the ...Create functions so that, for example,
  // category[0] will always be the Computer category, regardless of the order
  // in which the elements of promise.all's argument complete.
  async function categoryCreate(index, name, description) {
    const category = new Category({ name: name, description: description });
    await category.save();
    categories[index] = category;
    console.log(`Added category: ${name}`);
  }
  
  async function itemCreate(name, description, price, category, numberInStock) {
  
    const item = new Item({ 
        name: name,
        description: description, 
        price: price, 
        category: category,
        numberInStock: numberInStock
    });
  
    await item.save();
    console.log(`Added item: ${name} ${price}`);
  }
  
  async function createCategories() {
    console.log("Adding genres");
    await Promise.all([
        categoryCreate(0, "Televisions", "Display devices that use electronics to produce images and sound." ),
        categoryCreate(1, "Computers", "Electronic machines that can store, retrieve, and process data."),
        categoryCreate(2, "Mobile Phones", "Handheld devices that can make and receive calls, send and receive text messages, access the internet, and run a variety of applications."),
        categoryCreate(3, "Home Appliances", "Electronic devices that are used for household tasks."),
    ]);
  }

  // add picture links and description on phones
  async function createItems() {
    console.log("Adding items");
    await Promise.all([
        itemCreate('Samsung 55 inches Class Crystal UHD TU-8000 Series LED 4K Smart TV', "Enjoy stunning visuals with this Samsung 4K TV featuring vivid colors and clear details. Smart TV capabilities allow you to stream your favorite shows and movies.", 599.99, categories[0], 4),
        itemCreate('LG 65 inches Class C2 Series OLED Smart TV', "Experience exceptional picture quality with this LG OLED TV. Self-lit pixels deliver deep blacks and perfect contrast for an immersive viewing experience.", 1799.99,  categories[0], 2),
        itemCreate("TCL 32 inches Class 3-Series HD Roku Smart TV", "This budget-friendly TCL TV offers great value with HD resolution and built-in Roku for easy access to streaming services.", 199.99, categories[0], 1),
        itemCreate("Sony 43 inches Class X80K Series LED 4K HDR Smart TV", "Immerse yourself in vibrant colors and realistic details with this Sony 4K HDR TV. Smart features allow for easy content access and control.", 749.99, categories[0], 0),
        itemCreate("Vizio 70 inches Class V-Series 4K LED Smart TV", "Enjoy a larger-than-life viewing experience with this Vizio 70 inches 4K TV. Perfect for family movie nights or watching sporting events.", 899.99, categories[0], 5),
        itemCreate("Apple MacBook Air M2 Chip - 13.6 inches Liquid Retina Display, 8GB RAM, 256GB SSD", "The new MacBook Air features the powerful M2 chip for smooth performance and long battery life. The sleek design is perfect for on-the-go users.", 1199.00, categories[1], 6),
        itemCreate("Microsoft Surface Laptop Studio - 14.4 inches Touchscreen, Intel Core i7 Processor, 16GB RAM, 512GB SSD", "This versatile laptop can transform from a traditional laptop to a tablet mode for drawing and note-taking. Powerful specs handle demanding tasks.", 1599.00, categories[1], 10),
        itemCreate("HP Pavilion Desktop - Intel Core i5 Processor, 8GB RAM, 512GB SSD", "This affordable desktop computer offers good performance for everyday tasks like browsing the web and working on documents. Great for home or office use.", 599.99, categories[1], 11),
        itemCreate("ASUS ROG Strix G15 Advantage Edition Gaming Laptop - AMD Ryzen 9 Processor, 16GB RAM, 1TB SSD, RTX 3060 Graphics", "This powerful gaming laptop can handle even the most demanding games with ease. High refresh rate display and dedicated graphics card provide a smooth and immersive gaming experience.", 1899.99, categories[1], 8),
        itemCreate("Acer Chromebook Spin 713 - 13.5 inches Touchscreen Chromebook, Intel Core i5 Processor, 8GB RAM, 256GB SSD", "This Chromebook offers a fast and secure browsing experience with a long battery life. The touchscreen display provides added versatility.", 649.99, categories[1], 2),
        itemCreate("Samsung Galaxy S22 Ultra - 6.8 inches Dynamic AMOLED 2X Display, Snapdragon 8 Gen 1 Processor, 128GB Storage", "", 1099.00,  categories[2], 5),
        itemCreate("Google Pixel 6 Pro - 6.7 inches LTPO OLED Display, Google Tensor Chip, 128GB Storage", "", 899.00, categories[2], 9),
        itemCreate("Motorola Moto G Stylus (2022) - 6.8 inches LCD Display, MediaTek Helio G88 Processor, 128GB Storage", "", 299, categories[2], 7),
        itemCreate("Refrigerator (20 cu. ft., Stainless Steel)", "This spacious refrigerator features ample storage for all your groceries. The stainless steel finish adds a sleek touch to your kitchen.", 799.99, categories[3], 2),
        itemCreate("Robot Vacuum Cleaner", "Effortlessly clean your floors with this robot vacuum cleaner. It automatically navigates your home, picking up dirt and debris.", 249.99, categories[3], 1),
    ]);
  }