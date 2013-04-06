using Interation.iRepeater.Web.ViewModel;

namespace Interation.iRepeater.Service.Contract
{
    public static class ProductContractExtension
    {
        public static ProductViewModel ToViewModel(this ProductContract contract)
        {
            return new ProductViewModel
            {
            };
        }
    }
}
