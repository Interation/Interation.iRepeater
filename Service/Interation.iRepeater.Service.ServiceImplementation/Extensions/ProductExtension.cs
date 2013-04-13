using Interation.iRepeater.Service.Contract;

namespace Interation.iRepeater.Repository.Entity
{
    public static class ProductExtension
    {
        public static ProductContract ToContractModel(this Product entity)
        {
            return new ProductContract
            {
                Id = entity.Id,
                Name = entity.Name,
                IconUrl = entity.IconUrl,
                Class = entity.Class,
                SubClass = entity.SubClass,
                Price = (float)(entity.Price ?? 0),
                Star = (float)(entity.Star ?? 0),
                ScrollingNumber = entity.ScrollingNumber ?? 0,
                Downloads = entity.Downloads ?? 0,
                CreatedDate = entity.CreatedDate,
                UpdatedDate = entity.UpdatedDate
            };
        }
    }
}
