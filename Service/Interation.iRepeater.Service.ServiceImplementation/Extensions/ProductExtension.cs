using Interation.iRepeater.Service.Contract;

namespace Interation.iRepeater.Repository.Entity
{
    public static class ProductExtension
    {
        public static ProductContract ToContractModel(this Product entity)
        {
            return new ProductContract
            {

            };
        }
    }
}
