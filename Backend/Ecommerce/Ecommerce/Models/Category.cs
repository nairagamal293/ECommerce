using System.ComponentModel.DataAnnotations;

namespace Ecommerce.Models
{
    public  class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; }

        [MaxLength(200)]
        public string Description { get; set; }

        public ICollection<Product> Products { get; set; }
    }
}
