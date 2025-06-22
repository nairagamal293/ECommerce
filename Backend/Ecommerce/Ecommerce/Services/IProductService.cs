using Ecommerce.DTOs;

namespace Ecommerce.Services
{
    public interface IProductService
    {
        Task<ProductReadDto> CreateProductAsync(ProductCreateDto productCreateDto);
        Task<ProductReadDto> GetProductByIdAsync(int id);
        Task<IEnumerable<ProductReadDto>> GetAllProductsAsync();
        Task<ProductReadDto> UpdateProductAsync(int id, ProductUpdateDto productUpdateDto);
        Task<bool> DeleteProductAsync(int id);
        Task<string> UploadProductImageAsync(int productId, IFormFile file);
    }
}
