using Interation.iRepeater.Web.ViewModel;

namespace Interation.iRepeater.Service.Contract
{
    public static class ProductContractExtension
    {
        public static ProductViewModel ToViewModel(this ProductContract contract)
        {
            return new ProductViewModel
            {
                Id = contract.Id,
                Name = contract.Name,
                IconUrl = contract.IconUrl,
                Class = contract.Class,
                SubClass = contract.SubClass,
                Price = contract.Price == 0 ? "Free" : string.Format("$ {0:0.00}", contract.Price),
                Star = (int)contract.Star,
                ScrollingNumber = contract.ScrollingNumber,
                Downloads = contract.Downloads,
                CreatedDate = contract.CreatedDate,
                UpdatedDate = contract.UpdatedDate
            };
        }
    }
}
