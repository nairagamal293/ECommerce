using Ecommerce.Data;
using Ecommerce.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Utilities
{
    public static class SeedData
    {
        public static async Task Initialize(ApplicationDbContext context,
            UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            // Create roles
            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new IdentityRole("Admin"));
            }

            if (!await roleManager.RoleExistsAsync("User"))
            {
                await roleManager.CreateAsync(new IdentityRole("User"));
            }

            // Create admin user
            var adminEmail = "admin@example.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new User
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FirstName = "Admin",
                    LastName = "User",
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(adminUser, "Admin@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }

            // Seed categories
            if (!await context.Categories.AnyAsync())
            {
                var categories = new List<Category>
                {
                    new Category { Name = "Electronics", Description = "Electronic devices" },
                    new Category { Name = "Clothing", Description = "Apparel and accessories" },
                    new Category { Name = "Home & Kitchen", Description = "Home appliances and kitchenware" },
                    new Category { Name = "Books", Description = "Books and stationery" },
                    new Category { Name = "Sports", Description = "Sports equipment" }
                };

                await context.Categories.AddRangeAsync(categories);
                await context.SaveChangesAsync();
            }

            // Seed products
            if (!await context.Products.AnyAsync())
            {
                var electronicsCategory = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Electronics");
                var clothingCategory = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Clothing");

                var products = new List<Product>
                {
                    new Product
                    {
                        Name = "Smartphone",
                        Description = "Latest smartphone with advanced features",
                        Price = 999.99m,
                        DiscountedPrice = 899.99m,
                        QuantityInStock = 50,
                        IsAvailable = true,
                        CategoryId = electronicsCategory.Id
                    },
                    new Product
                    {
                        Name = "Laptop",
                        Description = "High-performance laptop",
                        Price = 1299.99m,
                        QuantityInStock = 30,
                        IsAvailable = true,
                        CategoryId = electronicsCategory.Id
                    },
                    new Product
                    {
                        Name = "T-Shirt",
                        Description = "Comfortable cotton t-shirt",
                        Price = 19.99m,
                        DiscountedPrice = 14.99m,
                        QuantityInStock = 100,
                        IsAvailable = true,
                        CategoryId = clothingCategory.Id
                    },
                    new Product
                    {
                        Name = "Jeans",
                        Description = "Classic denim jeans",
                        Price = 49.99m,
                        QuantityInStock = 75,
                        IsAvailable = true,
                        CategoryId = clothingCategory.Id
                    }
                };

                await context.Products.AddRangeAsync(products);
                await context.SaveChangesAsync();
            }
        }
    }
}
