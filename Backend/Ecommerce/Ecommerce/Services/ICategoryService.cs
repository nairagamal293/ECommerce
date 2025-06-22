using Ecommerce.DTOs;

namespace Ecommerce.Services
{
    public interface ICategoryService
    {
        Task<CategoryReadDto> CreateCategoryAsync(CategoryCreateDto categoryCreateDto);
        Task<CategoryReadDto> GetCategoryByIdAsync(int id);
        Task<IEnumerable<CategoryReadDto>> GetAllCategoriesAsync();
        Task<CategoryReadDto> UpdateCategoryAsync(int id, CategoryUpdateDto categoryUpdateDto);
        Task<bool> DeleteCategoryAsync(int id);
    }
}
